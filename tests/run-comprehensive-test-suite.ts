#!/usr/bin/env tsx

/**
 * DocCraft-AI Comprehensive Test Suite Runner
 *
 * MCP Context Block:
 * role: qa-engineer,
 * tier: Pro,
 * file: "tests/run-comprehensive-test-suite.ts",
 * allowedActions: ["execute", "orchestrate", "report", "validate"],
 * theme: "comprehensive_test_orchestration"
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TestSuiteResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  testCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  coverage?: number;
  errors?: string[];
}

interface TestExecutionReport {
  timestamp: string;
  duration: number;
  suites: TestSuiteResult[];
  summary: {
    totalSuites: number;
    passedSuites: number;
    failedSuites: number;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    overallSuccessRate: number;
    criticalIssues: number;
  };
  recommendations: string[];
  nextSteps: string[];
}

class ComprehensiveTestRunner {
  private results: TestSuiteResult[] = [];
  private startTime: number = 0;
  private reportDir: string;

  constructor() {
    this.reportDir = join(process.cwd(), 'test-reports');
    this.ensureReportDirectory();
  }

  async runCompleteTestSuite(): Promise<TestExecutionReport> {
    console.log('🚀 DocCraft-AI Comprehensive Test Suite Runner');
    console.log('='.repeat(60));

    this.startTime = Date.now();

    try {
      // Run unit tests
      await this.runUnitTests();

      // Run integration tests
      await this.runIntegrationTests();

      // Run performance benchmarks
      await this.runPerformanceBenchmarks();

      // Run quality assurance audit
      await this.runQualityAssuranceAudit();

      // Run E2E tests
      await this.runE2ETests();

      // Generate comprehensive report
      const report = this.generateExecutionReport();

      // Save report to file
      this.saveReport(report);

      // Display summary
      this.displaySummary(report);

      return report;
    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      throw error;
    }
  }

  private ensureReportDirectory(): void {
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  private async runUnitTests(): Promise<void> {
    console.log('\n📊 Running Unit Tests...');
    const startTime = Date.now();

    try {
      const output = execSync('npm test -- --silent --json', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      const testResult = JSON.parse(output);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'Unit Tests',
        status: testResult.success ? 'passed' : 'failed',
        duration,
        testCount: testResult.numTotalTests,
        passedCount: testResult.numPassedTests,
        failedCount: testResult.numFailedTests,
        skippedCount: testResult.numPendingTests,
        coverage: testResult.coverage?.total?.branches?.pct || 0,
        errors: testResult.testResults
          .filter((result: any) => result.status === 'failed')
          .map((result: any) => result.message),
      });

      console.log(`✅ Unit Tests completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'Unit Tests',
        status: 'failed',
        duration,
        testCount: 0,
        passedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });

      console.log(`❌ Unit Tests failed after ${duration}ms`);
    }
  }

  private async runIntegrationTests(): Promise<void> {
    console.log('\n🔗 Running Integration Tests...');
    const startTime = Date.now();

    try {
      const output = execSync(
        'npx jest tests/integration/ai-system-integration.test.ts --silent --json',
        {
          encoding: 'utf8',
          cwd: process.cwd(),
        }
      );

      const testResult = JSON.parse(output);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'Integration Tests',
        status: testResult.success ? 'passed' : 'failed',
        duration,
        testCount: testResult.numTotalTests,
        passedCount: testResult.numPassedTests,
        failedCount: testResult.numFailedTests,
        skippedCount: testResult.numPendingTests,
        errors: testResult.testResults
          .filter((result: any) => result.status === 'failed')
          .map((result: any) => result.message),
      });

      console.log(`✅ Integration Tests completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'Integration Tests',
        status: 'failed',
        duration,
        testCount: 0,
        passedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });

      console.log(`❌ Integration Tests failed after ${duration}ms`);
    }
  }

  private async runPerformanceBenchmarks(): Promise<void> {
    console.log('\n⚡ Running Performance Benchmarks...');
    const startTime = Date.now();

    try {
      const output = execSync(
        'npx jest tests/performance/performance-benchmarks.test.ts --silent --json',
        {
          encoding: 'utf8',
          cwd: process.cwd(),
        }
      );

      const testResult = JSON.parse(output);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'Performance Benchmarks',
        status: testResult.success ? 'passed' : 'failed',
        duration,
        testCount: testResult.numTotalTests,
        passedCount: testResult.numPassedTests,
        failedCount: testResult.numFailedTests,
        skippedCount: testResult.numPendingTests,
        errors: testResult.testResults
          .filter((result: any) => result.status === 'failed')
          .map((result: any) => result.message),
      });

      console.log(`✅ Performance Benchmarks completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'Performance Benchmarks',
        status: 'failed',
        duration,
        testCount: 0,
        passedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });

      console.log(`❌ Performance Benchmarks failed after ${duration}ms`);
    }
  }

  private async runQualityAssuranceAudit(): Promise<void> {
    console.log('\n🔍 Running Quality Assurance Audit...');
    const startTime = Date.now();

    try {
      const output = execSync(
        'npx jest tests/quality/automated-quality-assurance.test.ts --silent --json',
        {
          encoding: 'utf8',
          cwd: process.cwd(),
        }
      );

      const testResult = JSON.parse(output);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'Quality Assurance Audit',
        status: testResult.success ? 'passed' : 'failed',
        duration,
        testCount: testResult.numTotalTests,
        passedCount: testResult.numPassedTests,
        failedCount: testResult.numFailedTests,
        skippedCount: testResult.numPendingTests,
        errors: testResult.testResults
          .filter((result: any) => result.status === 'failed')
          .map((result: any) => result.message),
      });

      console.log(`✅ Quality Assurance Audit completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'Quality Assurance Audit',
        status: 'failed',
        duration,
        testCount: 0,
        passedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });

      console.log(`❌ Quality Assurance Audit failed after ${duration}ms`);
    }
  }

  private async runE2ETests(): Promise<void> {
    console.log('\n🌐 Running End-to-End Tests...');
    const startTime = Date.now();

    try {
      // Run a subset of E2E tests for comprehensive validation
      const output = execSync(
        'npx playwright test --reporter=json --project=chromium',
        {
          encoding: 'utf8',
          cwd: process.cwd(),
          timeout: 300000, // 5 minutes timeout
        }
      );

      const testResult = JSON.parse(output);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'End-to-End Tests',
        status: testResult.status === 'passed' ? 'passed' : 'failed',
        duration,
        testCount: testResult.suites?.[0]?.specs?.length || 0,
        passedCount:
          testResult.suites?.[0]?.specs?.filter(
            (s: any) => s.tests?.[0]?.results?.[0]?.status === 'passed'
          )?.length || 0,
        failedCount:
          testResult.suites?.[0]?.specs?.filter(
            (s: any) => s.tests?.[0]?.results?.[0]?.status === 'failed'
          )?.length || 0,
        skippedCount:
          testResult.suites?.[0]?.specs?.filter(
            (s: any) => s.tests?.[0]?.results?.[0]?.status === 'skipped'
          )?.length || 0,
        errors:
          testResult.suites?.[0]?.specs
            ?.filter(
              (s: any) => s.tests?.[0]?.results?.[0]?.status === 'failed'
            )
            ?.map(
              (s: any) =>
                s.tests?.[0]?.results?.[0]?.error?.message || 'Unknown error'
            ) || [],
      });

      console.log(`✅ End-to-End Tests completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'End-to-End Tests',
        status: 'failed',
        duration,
        testCount: 0,
        passedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });

      console.log(`❌ End-to-End Tests failed after ${duration}ms`);
    }
  }

  private generateExecutionReport(): TestExecutionReport {
    const totalDuration = Date.now() - this.startTime;
    const totalSuites = this.results.length;
    const passedSuites = this.results.filter(r => r.status === 'passed').length;
    const failedSuites = this.results.filter(r => r.status === 'failed').length;

    const totalTests = this.results.reduce((sum, r) => sum + r.testCount, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passedCount, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failedCount, 0);

    const overallSuccessRate = totalTests > 0 ? totalPassed / totalTests : 0;
    const criticalIssues = this.results.filter(
      r => r.status === 'failed'
    ).length;

    const recommendations = this.generateRecommendations();
    const nextSteps = this.generateNextSteps();

    return {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      suites: this.results,
      summary: {
        totalSuites,
        passedSuites,
        failedSuites,
        totalTests,
        totalPassed,
        totalFailed,
        overallSuccessRate,
        criticalIssues,
      },
      recommendations,
      nextSteps,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const failedSuites = this.results.filter(r => r.status === 'failed');
    if (failedSuites.length > 0) {
      recommendations.push(
        `Address ${failedSuites.length} failed test suite(s) before production deployment`
      );
    }

    const lowCoverageSuites = this.results.filter(
      r => r.coverage && r.coverage < 90
    );
    if (lowCoverageSuites.length > 0) {
      recommendations.push(
        'Improve test coverage to meet enterprise standards (90%+)'
      );
    }

    const slowSuites = this.results.filter(r => r.duration > 30000); // 30 seconds
    if (slowSuites.length > 0) {
      recommendations.push(
        'Optimize test execution time for better CI/CD pipeline efficiency'
      );
    }

    if (this.results.some(r => r.errors && r.errors.length > 0)) {
      recommendations.push(
        'Review and fix test errors to ensure system reliability'
      );
    }

    return recommendations;
  }

  private generateNextSteps(): string[] {
    const nextSteps: string[] = [];

    if (this.results.every(r => r.status === 'passed')) {
      nextSteps.push('All tests passed! Proceed with production deployment');
      nextSteps.push(
        'Schedule regular test runs to maintain quality standards'
      );
    } else {
      nextSteps.push('Fix failing tests before proceeding');
      nextSteps.push('Review test coverage and add missing test cases');
      nextSteps.push('Investigate performance bottlenecks in slow test suites');
    }

    nextSteps.push('Set up automated testing in CI/CD pipeline');
    nextSteps.push('Configure test result notifications for team awareness');
    nextSteps.push('Plan next test suite enhancement cycle');

    return nextSteps;
  }

  private saveReport(report: TestExecutionReport): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `comprehensive-test-report-${timestamp}.json`;
    const filepath = join(this.reportDir, filename);

    writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Test report saved to: ${filepath}`);
  }

  private displaySummary(report: TestExecutionReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPREHENSIVE TEST SUITE EXECUTION SUMMARY');
    console.log('='.repeat(60));

    console.log(
      `\n⏱️  Total Execution Time: ${(report.duration / 1000).toFixed(2)}s`
    );
    console.log(
      `📊 Overall Success Rate: ${(report.summary.overallSuccessRate * 100).toFixed(1)}%`
    );
    console.log(
      `✅ Passed Suites: ${report.summary.passedSuites}/${report.summary.totalSuites}`
    );
    console.log(`❌ Failed Suites: ${report.summary.failedSuites}`);
    console.log(`🧪 Total Tests: ${report.summary.totalTests}`);
    console.log(`🎯 Passed Tests: ${report.summary.totalPassed}`);
    console.log(`💥 Failed Tests: ${report.summary.totalFailed}`);

    console.log('\n📋 SUITE DETAILS:');
    report.suites.forEach(suite => {
      const statusIcon = suite.status === 'passed' ? '✅' : '❌';
      const coverageInfo = suite.coverage
        ? ` (Coverage: ${suite.coverage}%)`
        : '';
      console.log(
        `${statusIcon} ${suite.name}: ${suite.passedCount}/${suite.testCount} passed in ${suite.duration}ms${coverageInfo}`
      );
    });

    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`• ${rec}`));
    }

    if (report.nextSteps.length > 0) {
      console.log('\n🚀 NEXT STEPS:');
      report.nextSteps.forEach(step => console.log(`• ${step}`));
    }

    console.log('\n' + '='.repeat(60));

    if (report.summary.criticalIssues === 0) {
      console.log(
        '🎉 All critical tests passed! System is ready for production.'
      );
    } else {
      console.log(
        '⚠️  Critical issues detected. Please address before production deployment.'
      );
    }

    console.log('='.repeat(60));
  }
}

// Main execution
async function main() {
  try {
    const runner = new ComprehensiveTestRunner();
    await runner.runCompleteTestSuite();

    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ComprehensiveTestRunner, TestExecutionReport, TestSuiteResult };
