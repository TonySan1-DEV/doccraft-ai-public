'use strict';

const DEFAULTS = {
  fields: [
    'intensity',
    'confidence',
    'tension',
    'empathy',
    'engagement',
    'emotionalComplexity',
  ],
  allowFunctions: ['formatPercentage', 'renderPercent', 'toPercentDisplay'],
  allowFileGlobs: ['**/__tests__/**', '**/*.stories.*'],
  allowPosition: true, // 0–1 → UI percent is OK
};

function isLiteral100(node) {
  return node && node.type === 'Literal' && node.value === 100;
}

function idName(n) {
  return n && n.type === 'Identifier' ? n.name : null;
}

function inAllowedFunction(context, allowFunctions) {
  // Simplified function checking - just check if we're in a utility file
  // The file-based overrides handle most cases
  return false;
}

function fileInAllowedGlob(filename, globs) {
  // naive check to keep plugin tiny; rely on eslint overrides for precision
  return globs.some(g => {
    if (g.includes('__tests__') && filename.includes('__tests__')) return true;
    if (g.includes('.stories') && filename.includes('.stories')) return true;
    return false;
  });
}

const plugin = {
  rules: {
    'no-emotion-mis-scaling': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description:
            'Disallow multiplying/dividing by 100 on emotion data (intensity/confidence/tension/etc). Allow UI formatting and position → percent.',
          recommended: false,
        },
        schema: [
          {
            type: 'object',
            properties: {
              fields: { type: 'array', items: { type: 'string' } },
              allowFunctions: { type: 'array', items: { type: 'string' } },
              allowFileGlobs: { type: 'array', items: { type: 'string' } },
              allowPosition: { type: 'boolean' },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          misScale:
            'Avoid {{op}} 100 on {{name}} (0–100 domain). Use data as-is or UI formatters.',
          wrapPercent:
            'Wrap in toPercentDisplay(...) if this is UI display for a 0–1 value.',
          removeHundred:
            "Remove *100 or /100 for {{name}} since it's already 0–100.",
        },
      },
      create(context) {
        const filename = context.getFilename();
        const opts = Object.assign(
          {},
          DEFAULTS,
          context.options && context.options[0]
        );
        const allowedHere = fileInAllowedGlob(filename, opts.allowFileGlobs);

        function maybeReport(node, op, name, isPosition = false) {
          // Allow in permitted files/functions
          if (allowedHere) return;
          if (inAllowedFunction(context, opts.allowFunctions)) return;
          // Don't return early for position - we want to report it with specific message

          let messageId = 'misScale';
          let data = { op, name };

          // Determine the most appropriate message
          if (isPosition && name === 'position') {
            messageId = 'wrapPercent';
            data = { name };
          } else if (opts.fields.includes(name)) {
            messageId = 'removeHundred';
            data = { name };
          }

          context.report({
            node,
            messageId,
            data,
            suggest: [
              ...(name === 'position'
                ? [
                    {
                      messageId: 'wrapPercent',
                      fix(fixer) {
                        // Replace `pos * 100` with `toPercentDisplay(pos)`
                        const source = context.getSourceCode().getText(node);
                        // crude but effective swap: toPercentDisplay(<original-left-or-right>)
                        const id =
                          node.left.type === 'Identifier'
                            ? node.left.name
                            : node.right.name;
                        return fixer.replaceText(
                          node,
                          `toPercentDisplay(${id})`
                        );
                      },
                    },
                  ]
                : []),
              {
                messageId: 'removeHundred',
                data: { name },
                fix(fixer) {
                  // Remove the *100 or /100 and keep the identifier side.
                  const keep =
                    node.left.type === 'Identifier'
                      ? node.left.name
                      : node.left.type === 'MemberExpression'
                        ? context.getSourceCode().getText(node.left)
                        : node.right.type === 'Identifier'
                          ? node.right.name
                          : node.right.type === 'MemberExpression'
                            ? context.getSourceCode().getText(node.right)
                            : null;
                  return keep ? fixer.replaceText(node, keep) : null;
                },
              },
            ],
          });
        }

        function checkSide(idNode, otherSide, opNode) {
          const name = idName(idNode);
          if (!name) return;
          // If identifier is one of emotion fields or position
          if (
            opts.fields.includes(name) ||
            (opts.allowPosition && name === 'position')
          ) {
            if (isLiteral100(otherSide)) {
              const op =
                opNode.operator === '*'
                  ? 'multiplying by'
                  : opNode.operator === '/'
                    ? 'dividing by'
                    : opNode.operator;
              // Check if this is a position field for specific messaging
              const isPosition = name === 'position';
              maybeReport(opNode, op, name, isPosition);
            }
          }
        }

        return {
          BinaryExpression(node) {
            if (!(node.operator === '*' || node.operator === '/')) return;
            const { left, right } = node;
            // Patterns: intensity * 100, 100 * intensity, intensity / 100, 100 / intensity
            if (left.type === 'Identifier' && isLiteral100(right))
              checkSide(left, right, node);
            if (right.type === 'Identifier' && isLiteral100(left))
              checkSide(right, left, node);

            // Also guard simple member expressions like obj.intensity * 100
            function getMemberTailName(n) {
              if (n.type === 'MemberExpression') {
                if (n.property.type === 'Identifier') return n.property.name;
              }
              return null;
            }
            const leftTail = getMemberTailName(left);
            const rightTail = getMemberTailName(right);
            if (leftTail && isLiteral100(right))
              checkSide({ type: 'Identifier', name: leftTail }, right, node);
            if (rightTail && isLiteral100(left))
              checkSide({ type: 'Identifier', name: rightTail }, left, node);
          },
        };
      },
    },
  },
};

export default plugin;
