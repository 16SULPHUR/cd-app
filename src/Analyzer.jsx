import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState, 
  useEdgesState,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

const SyntaxTreeVisualizer = () => {
  const [inputCode, setInputCode] = useState('a + b * c');
  const [parsedTree, setParsedTree] = useState(null);
  const [error, setError] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Function to parse the input code and generate an AST
  const parseCode = () => {
    try {
      setError('');
      const tokens = tokenize(inputCode);
      const ast = buildAST(tokens);
      setParsedTree(ast);
    } catch (err) {
      setError(err.message);
      setParsedTree(null);
      setNodes([]);
      setEdges([]);
    }
  };

  // Lexical Analysis: Tokenize the input string
  const tokenize = (input) => {
    const tokenRegex = /\s*([a-zA-Z_][a-zA-Z0-9_]*|\d+|\+|\-|\*|\/|\(|\)|\=|\;|\{|\}|\<|\>|\!|\&|\||\^|\%|\:|\?|\.|\,|\[|\])\s*/g;
    const tokens = [];
    let match;

    while ((match = tokenRegex.exec(input)) !== null) {
      const value = match[1];
      let type;

      if (/[a-zA-Z_][a-zA-Z0-9_]*/.test(value)) {
        type = 'IDENTIFIER';
      } else if (/\d+/.test(value)) {
        type = 'NUMBER';
      } else {
        type = 'OPERATOR';
      }

      tokens.push({ type, value });
    }

    return tokens;
  };

  // Recursive descent parser to build AST
  const buildAST = (tokens) => {
    let position = 0;

    // Helper functions for parsing
    const peek = () => tokens[position];
    const consume = () => tokens[position++];
    const isAtEnd = () => position >= tokens.length;

    // Expression parsing
    const parseExpression = () => {
      return parseBinaryExpression();
    };

    // Parse binary expressions with precedence
    const parseBinaryExpression = (precedence = 0) => {
      const operators = {
        '+': { precedence: 1, associativity: 'LEFT' },
        '-': { precedence: 1, associativity: 'LEFT' },
        '*': { precedence: 2, associativity: 'LEFT' },
        '/': { precedence: 2, associativity: 'LEFT' },
      };

      let left = parsePrimary();

      while (!isAtEnd()) {
        const token = peek();
        
        if (token.type !== 'OPERATOR' || !operators[token.value]) {
          break;
        }

        const op = operators[token.value];
        
        // Check precedence
        if (op.precedence <= precedence) {
          break;
        }

        consume(); // Consume the operator

        // Handle right-associative vs left-associative
        const nextPrecedence = op.associativity === 'LEFT' ? op.precedence + 1 : op.precedence;
        const right = parseBinaryExpression(nextPrecedence);

        left = {
          type: 'BinaryExpression',
          operator: token.value,
          left,
          right,
        };
      }

      return left;
    };

    // Parse primary expressions (identifiers, numbers, parenthesized expressions)
    const parsePrimary = () => {
      const token = peek();

      if (token.type === 'IDENTIFIER') {
        consume();
        return {
          type: 'Identifier',
          name: token.value
        };
      }

      if (token.type === 'NUMBER') {
        consume();
        return {
          type: 'Literal',
          value: parseInt(token.value, 10)
        };
      }

      if (token.value === '(') {
        consume(); // Consume the opening parenthesis
        const expr = parseExpression();
        
        if (isAtEnd() || peek().value !== ')') {
          throw new Error('Expected closing parenthesis');
        }
        
        consume(); // Consume the closing parenthesis
        return expr;
      }

      throw new Error(`Unexpected token: ${token.value}`);
    };

    // Start parsing from the top level
    const result = parseExpression();
    
    if (!isAtEnd()) {
      throw new Error(`Unexpected token after expression: ${peek().value}`);
    }
    
    return result;
  };

  // Convert AST to React Flow nodes and edges
  const convertASTToFlowElements = useCallback((ast) => {
    if (!ast) return { nodes: [], edges: [] };
    
    const nodes = [];
    const edges = [];
    let nodeId = 0;
    
    // Node type styling
    const nodeTypes = {
      'BinaryExpression': {
        style: {
          background: 'linear-gradient(to bottom right, #4F46E5, #7C3AED)',
          color: 'white',
          border: 'none',
          width: 150,
        },
        className: 'rounded-xl shadow-lg'
      },
      'Identifier': {
        style: {
          background: 'linear-gradient(to bottom right, #10B981, #059669)',
          color: 'white',
          border: 'none',
          width: 120,
        },
        className: 'rounded-xl shadow-lg'
      },
      'Literal': {
        style: {
          background: 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)',
          color: 'white',
          border: 'none',
          width: 120,
        },
        className: 'rounded-xl shadow-lg'
      }
    };
    

    // Helper function to recursively process nodes
    const processNode = (node, depth = 0, x = 0) => {
      if (!node) return null;
      
      const currentId = `node-${nodeId++}`;
      let label = '';
      
      if (node.type === 'BinaryExpression') {
        label = node.operator;
      } else if (node.type === 'Identifier') {
        label = node.name;
      } else if (node.type === 'Literal') {
        label = node.value.toString();
      }
      
      const nodeConfig = nodeTypes[node.type] || {
        style: { 
          background: '#6B7280', 
          color: 'white', 
          border: 'none', 
          width: 120 
        },
        className: 'rounded-xl shadow-lg'
      };
      
      // Create the node
      nodes.push({
        id: currentId,
        data: { 
          label: (
            <div className="text-center p-2">
              <div className="font-bold text-lg">{label}</div>
              <div className="text-xs opacity-80">{node.type}</div>
            </div>
          )
        },
        position: { x: x * 200, y: depth * 150 },
        style: nodeConfig.style,
        className: nodeConfig.className,
        sourcePosition: 'bottom',
        targetPosition: 'top',
      });
      
      // Process left child
      if (node.left) {
        const leftId = processNode(node.left, depth + 1, x - 1);
        edges.push({
          id: `edge-${currentId}-${leftId}`,
          source: currentId,
          target: leftId,
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#64748B',
          },
          style: { stroke: '#94A3B8', strokeWidth: 2 },
        });
      }
      
      // Process right child
      if (node.right) {
        const rightId = processNode(node.right, depth + 1, x + 1);
        edges.push({
          id: `edge-${currentId}-${rightId}`,
          source: currentId,
          target: rightId,
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#64748B',
          },
          style: { stroke: '#94A3B8', strokeWidth: 2 },
        });
      }
      
      return currentId;
    };
    
    processNode(ast);
    
    return { nodes, edges };
  }, []);

  // Examples of expressions for demonstration
  const examples = [
    'a + b * c',
    '(a + b) * c',
    'x * (y + z) / 2',
    'a + b + c',
    'a * b * c',
    '(a + b) * (c - d)',
    '(x + y) * z / w',
    'a * (b + c) * d',
    '(p - q) / (r + s)',
    'x + y * z / w',
    '(a + b + c) * d',
    'x * (y - z + w)'
  ];

  // Handle example selection
  const handleExampleSelect = (example) => {
    setInputCode(example);
    setError('');
    setParsedTree(null);
    setNodes([]);
    setEdges([]);
  };

  // Update flow elements when the AST changes
  useEffect(() => {
    if (parsedTree) {
      const { nodes: newNodes, edges: newEdges } = convertASTToFlowElements(parsedTree);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [parsedTree, convertASTToFlowElements]);

  // Create layout options for React Flow
  const reactFlowStyle = {
    background: '#F8FAFC',
    width: '100%',
    height: 500,
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
          <h1 className="text-white text-3xl font-bold mb-2">
            Syntax Tree Visualizer
          </h1>
          <p className="text-white opacity-90">
            Visualize Abstract Syntax Trees (AST) for compiler design
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="codeInput" className="block text-gray-700 font-semibold mb-2">
              Enter Expression:
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <textarea
                id="codeInput"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-grow p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                rows="2"
                placeholder="Enter a simple expression (e.g., a + b * c)"
              />
              <button
                onClick={parseCode}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors whitespace-nowrap md:self-start"
              >
                Generate AST
              </button>
            </div>

            <div className="mt-4">
              <p className="text-gray-700 font-semibold mb-2">Try examples:</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleSelect(example)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm transition-colors border border-gray-300"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <div className="border rounded-xl p-6 bg-white shadow-inner">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Abstract Syntax Tree</h2>
            
            <div className="mb-2 text-sm text-gray-500 text-center">
              Click "Generate AST" after modifying the expression to update the tree.
            </div>
            
            <div style={{ height: 500, width: '100%' }} className="bg-gray-50 rounded-lg border">
              {nodes.length > 0 ? (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  attributionPosition="bottom-right"
                  style={reactFlowStyle}
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                  <Panel position="top-right" className="bg-white p-2 rounded shadow text-xs text-gray-500">
                    Drag to move | Scroll to zoom
                  </Panel>
                </ReactFlow>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2">Enter an expression and click "Generate AST" to visualize the syntax tree</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
            <h2 className="text-xl font-bold mb-2 text-gray-800">About Syntax Trees in Compiler Design</h2>
            <p className="text-gray-700 mb-4">
              In compiler design, an Abstract Syntax Tree (AST) is a tree representation of the syntactic structure of source code. Each node of the tree denotes a construct in the source code.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-bold text-gray-800 mb-2">Importance in Compilation</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Intermediate representation between parsing and code generation</li>
                  <li>Simplifies syntax analysis and semantic processing</li>
                  <li>Facilitates code optimization techniques</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-bold text-gray-800 mb-2">Compiler Phases</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>Lexical Analysis (Tokenization)</li>
                  <li>Syntax Analysis (Parsing)</li>
                  <li>Semantic Analysis</li>
                  <li>Intermediate Code Generation</li>
                  <li>Code Optimization</li>
                  <li>Code Generation</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyntaxTreeVisualizer;