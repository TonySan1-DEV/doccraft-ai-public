#!/usr/bin/env node

/**
 * DocCraft-AI Monitoring Stack Deployment Script
 *
 * This script deploys the complete monitoring stack including:
 * - Prometheus with custom rules and alerts
 * - Grafana with pre-configured dashboards
 * - AlertManager for notifications
 * - Node Exporter for system metrics
 *
 * Usage:
 *   node scripts/deploy-monitoring.mjs [environment]
 *
 * Environment options:
 *   - production: Deploy to production cluster
 *   - staging: Deploy to staging cluster
 *   - local: Deploy to local minikube/docker-desktop
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ENVIRONMENTS = {
  production: {
    namespace: 'monitoring',
    cluster: 'production',
    context: 'gke_doccraft-ai_production_us-central1-a_doccraft-ai-cluster',
  },
  staging: {
    namespace: 'monitoring-staging',
    cluster: 'staging',
    context:
      'gke_doccraft-ai_staging_us-central1-a_doccraft-ai-staging-cluster',
  },
  local: {
    namespace: 'monitoring',
    cluster: 'local',
    context: 'minikube',
  },
};

class MonitoringDeployer {
  constructor(environment = 'local') {
    this.environment = environment;
    this.config = ENVIRONMENTS[environment] || ENVIRONMENTS.local;
    this.baseDir = process.cwd();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...');

    try {
      // Check kubectl
      execSync('kubectl version --client', { stdio: 'pipe' });
      this.log('✓ kubectl found');
    } catch (error) {
      throw new Error('kubectl not found. Please install kubectl first.');
    }

    // Check if namespace exists
    try {
      execSync(`kubectl get namespace ${this.config.namespace}`, {
        stdio: 'pipe',
      });
      this.log(`✓ Namespace ${this.config.namespace} exists`);
    } catch (error) {
      this.log(`Creating namespace ${this.config.namespace}...`);
      execSync(`kubectl create namespace ${this.config.namespace}`, {
        stdio: 'inherit',
      });
    }

    // Set kubectl context
    try {
      execSync(`kubectl config use-context ${this.config.context}`, {
        stdio: 'pipe',
      });
      this.log(`✓ Using kubectl context: ${this.config.context}`);
    } catch (error) {
      this.log(
        `⚠️ Could not set context ${this.config.context}, using current context`
      );
    }
  }

  async deployPrometheus() {
    this.log('Deploying Prometheus...');

    const prometheusConfig = readFileSync(
      join(this.baseDir, 'k8s/monitoring/monitoring-stack.yml'),
      'utf8'
    );

    // Apply Prometheus configuration
    writeFileSync('/tmp/prometheus-config.yml', prometheusConfig);
    execSync(`kubectl apply -f /tmp/prometheus-config.yml`, {
      stdio: 'inherit',
    });

    // Wait for Prometheus to be ready
    this.log('Waiting for Prometheus to be ready...');
    execSync(
      `kubectl wait --for=condition=ready pod -l app=prometheus -n ${this.config.namespace} --timeout=300s`,
      { stdio: 'inherit' }
    );

    this.log('✓ Prometheus deployed successfully');
  }

  async deployGrafana() {
    this.log('Deploying Grafana...');

    // Create Grafana secret if it doesn't exist
    try {
      execSync(
        `kubectl get secret grafana-secret -n ${this.config.namespace}`,
        { stdio: 'pipe' }
      );
      this.log('✓ Grafana secret exists');
    } catch (error) {
      this.log('Creating Grafana secret...');
      const password = 'admin'; // In production, use a secure password
      const encodedPassword = Buffer.from(password).toString('base64');

      const secretYaml = `apiVersion: v1
kind: Secret
metadata:
  name: grafana-secret
  namespace: ${this.config.namespace}
type: Opaque
data:
  admin-password: ${encodedPassword}`;

      writeFileSync('/tmp/grafana-secret.yml', secretYaml);
      execSync(`kubectl apply -f /tmp/grafana-secret.yml`, {
        stdio: 'inherit',
      });
    }

    // Apply Grafana configuration
    execSync(`kubectl apply -f k8s/monitoring/monitoring-stack.yml`, {
      stdio: 'inherit',
    });

    // Wait for Grafana to be ready
    this.log('Waiting for Grafana to be ready...');
    execSync(
      `kubectl wait --for=condition=ready pod -l app=grafana -n ${this.config.namespace} --timeout=300s`,
      { stdio: 'inherit' }
    );

    this.log('✓ Grafana deployed successfully');
  }

  async deployAlertManager() {
    this.log('Deploying AlertManager...');

    // Apply AlertManager configuration
    execSync(`kubectl apply -f k8s/monitoring/monitoring-stack.yml`, {
      stdio: 'inherit',
    });

    // Wait for AlertManager to be ready
    this.log('Waiting for AlertManager to be ready...');
    execSync(
      `kubectl wait --for=condition=ready pod -l app=alertmanager -n ${this.config.namespace} --timeout=300s`,
      { stdio: 'inherit' }
    );

    this.log('✓ AlertManager deployed successfully');
  }

  async deployNodeExporter() {
    this.log('Deploying Node Exporter...');

    // Apply Node Exporter configuration
    execSync(`kubectl apply -f k8s/monitoring/monitoring-stack.yml`, {
      stdio: 'inherit',
    });

    // Wait for Node Exporter to be ready
    this.log('Waiting for Node Exporter to be ready...');
    execSync(
      `kubectl wait --for=condition=ready pod -l app=node-exporter -n ${this.config.namespace} --timeout=300s`,
      { stdio: 'inherit' }
    );

    this.log('✓ Node Exporter deployed successfully');
  }

  async configurePrometheusRules() {
    this.log('Configuring Prometheus rules...');

    const rulesConfig = readFileSync(
      join(this.baseDir, 'monitoring/prometheus-rules.yml'),
      'utf8'
    );

    // Create ConfigMap for Prometheus rules
    const rulesConfigMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: ${this.config.namespace}
data:
  alerts.yml: |
${rulesConfig
  .split('\n')
  .map(line => `    ${line}`)
  .join('\n')}`;

    writeFileSync('/tmp/prometheus-rules-configmap.yml', rulesConfigMap);
    execSync(`kubectl apply -f /tmp/prometheus-rules-configmap.yml`, {
      stdio: 'inherit',
    });

    this.log('✓ Prometheus rules configured');
  }

  async configureGrafanaDashboard() {
    this.log('Configuring Grafana dashboard...');

    const dashboardConfig = readFileSync(
      join(this.baseDir, 'monitoring/grafana-dashboard.json'),
      'utf8'
    );

    // Create ConfigMap for Grafana dashboard
    const dashboardConfigMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboard-doccraft
  namespace: ${this.config.namespace}
  labels:
    grafana_dashboard: "1"
data:
  doccraft-ai-dashboard.json: |
${dashboardConfig
  .split('\n')
  .map(line => `    ${line}`)
  .join('\n')}`;

    writeFileSync('/tmp/grafana-dashboard-configmap.yml', dashboardConfigMap);
    execSync(`kubectl apply -f /tmp/grafana-dashboard-configmap.yml`, {
      stdio: 'inherit',
    });

    this.log('✓ Grafana dashboard configured');
  }

  async verifyDeployment() {
    this.log('Verifying deployment...');

    try {
      // Check all pods are running
      const pods = execSync(`kubectl get pods -n ${this.config.namespace}`, {
        encoding: 'utf8',
      });
      console.log('\nPod Status:');
      console.log(pods);

      // Check services
      const services = execSync(
        `kubectl get services -n ${this.config.namespace}`,
        { encoding: 'utf8' }
      );
      console.log('\nServices:');
      console.log(services);

      // Check ingress if configured
      try {
        const ingress = execSync(
          `kubectl get ingress -n ${this.config.namespace}`,
          { encoding: 'utf8' }
        );
        console.log('\nIngress:');
        console.log(ingress);
      } catch (error) {
        this.log(
          'No ingress configured (this is normal for local deployments)',
          'warn'
        );
      }

      this.log('✓ Deployment verification completed');
    } catch (error) {
      this.log('⚠️ Deployment verification had issues', 'warn');
      console.error(error);
    }
  }

  async getAccessInfo() {
    this.log('Getting access information...');

    try {
      // Get service URLs
      const prometheusPort = execSync(
        `kubectl get service prometheus -n ${this.config.namespace} -o jsonpath='{.spec.ports[0].port}'`,
        { encoding: 'utf8' }
      ).trim();
      const grafanaPort = execSync(
        `kubectl get service grafana -n ${this.config.namespace} -o jsonpath='{.spec.ports[0].port}'`,
        { encoding: 'utf8' }
      ).trim();

      console.log('\n📊 Monitoring Stack Access Information:');
      console.log('=====================================');
      console.log(`Environment: ${this.environment}`);
      console.log(`Namespace: ${this.config.namespace}`);
      console.log(`Cluster: ${this.config.cluster}`);
      console.log('');
      console.log('Services:');
      console.log(
        `  Prometheus: http://localhost:${prometheusPort} (port-forward required for local)`
      );
      console.log(
        `  Grafana: http://localhost:${grafanaPort} (port-forward required for local)`
      );
      console.log('');
      console.log('Default Credentials:');
      console.log('  Grafana: admin / admin');
      console.log('');
      console.log('Port Forward Commands:');
      console.log(
        `  kubectl port-forward -n ${this.config.namespace} service/prometheus ${prometheusPort}:${prometheusPort}`
      );
      console.log(
        `  kubectl port-forward -n ${this.config.namespace} service/grafana ${grafanaPort}:${grafanaPort}`
      );
    } catch (error) {
      this.log('Could not retrieve access information', 'warn');
      console.error(error);
    }
  }

  async deploy() {
    try {
      this.log(
        `🚀 Starting DocCraft-AI monitoring stack deployment to ${this.environment}`
      );

      await this.checkPrerequisites();
      await this.deployPrometheus();
      await this.configurePrometheusRules();
      await this.deployGrafana();
      await this.configureGrafanaDashboard();
      await this.deployAlertManager();
      await this.deployNodeExporter();
      await this.verifyDeployment();
      await this.getAccessInfo();

      this.log('🎉 Monitoring stack deployment completed successfully!');
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const environment = process.argv[2] || 'local';

  if (!ENVIRONMENTS[environment]) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.error(
      `Valid environments: ${Object.keys(ENVIRONMENTS).join(', ')}`
    );
    process.exit(1);
  }

  const deployer = new MonitoringDeployer(environment);
  await deployer.deploy();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
