// import React, { useState, useEffect, useCallback } from 'react';
// import ReactFlow, { 
//   Background, 
//   Controls, 
//   MiniMap,
//   useNodesState, 
//   useEdgesState,
//   MarkerType,
//   Panel
// } from 'reactflow';
// import 'reactflow/dist/style.css';

// const SyntaxTreeVisualizer = () => {
//   const [inputCode, setInputCode] = useState('a + b * c');
//   const [parsedTree, setParsedTree] = useState(null);
//   const [error, setError] = useState('');
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
//   // Function to parse the input code and generate an AST
//   const parseCode = () => {
//     try {
//       setError('');
//       const tokens = tokenize(inputCode);
//       const ast = buildAST(tokens);
//       setParsedTree(ast);
//     } catch (err) {
//       setError(err.message);
//       setParsedTree(null);
//       setNodes([]);
//       setEdges([]);
//     }
//   };

//   // Lexical Analysis: Tokenize the input string
//   const tokenize = (input) => {
//     const tokenRegex = /\s*([a-zA-Z_][a-zA-Z0-9_]*|\d+|\+|\-|\*|\/|\(|\)|\=|\;|\{|\}|\<|\>|\!|\&|\||\^|\%|\:|\?|\.|\,|\[|\])\s*/g;
//     const tokens = [];
//     let match;

//     while ((match = tokenRegex.exec(input)) !== null) {
//       const value = match[1];
//       let type;

//       if (/[a-zA-Z_][a-zA-Z0-9_]*/.test(value)) {
//         type = 'IDENTIFIER';
//       } else if (/\d+/.test(value)) {
//         type = 'NUMBER';
//       } else {
//         type = 'OPERATOR';
//       }

//       tokens.push({ type, value });
//     }

//     return tokens;
//   };

//   // Recursive descent parser to build AST
//   const buildAST = (tokens) => {
//     let position = 0;

//     // Helper functions for parsing
//     const peek = () => tokens[position];
//     const consume = () => tokens[position++];
//     const isAtEnd = () => position >= tokens.length;

//     // Expression parsing
//     const parseExpression = () => {
//       return parseBinaryExpression();
//     };

//     // Parse binary expressions with precedence
//     const parseBinaryExpression = (precedence = 0) => {
//       const operators = {
//         '+': { precedence: 1, associativity: 'LEFT' },
//         '-': { precedence: 1, associativity: 'LEFT' },
//         '*': { precedence: 2, associativity: 'LEFT' },
//         '/': { precedence: 2, associativity: 'LEFT' },
//       };

//       let left = parsePrimary();

//       while (!isAtEnd()) {
//         const token = peek();
        
//         if (token.type !== 'OPERATOR' || !operators[token.value]) {
//           break;
//         }

//         const op = operators[token.value];
        
//         // Check precedence
//         if (op.precedence <= precedence) {
//           break;
//         }

//         consume(); // Consume the operator

//         // Handle right-associative vs left-associative
//         const nextPrecedence = op.associativity === 'LEFT' ? op.precedence + 1 : op.precedence;
//         const right = parseBinaryExpression(nextPrecedence);

//         left = {
//           type: 'BinaryExpression',
//           operator: token.value,
//           left,
//           right,
//         };
//       }

//       return left;
//     };

//     // Parse primary expressions (identifiers, numbers, parenthesized expressions)
//     const parsePrimary = () => {
//       const token = peek();

//       if (token.type === 'IDENTIFIER') {
//         consume();
//         return {
//           type: 'Identifier',
//           name: token.value
//         };
//       }

//       if (token.type === 'NUMBER') {
//         consume();
//         return {
//           type: 'Literal',
//           value: parseInt(token.value, 10)
//         };
//       }

//       if (token.value === '(') {
//         consume(); // Consume the opening parenthesis
//         const expr = parseExpression();
        
//         if (isAtEnd() || peek().value !== ')') {
//           throw new Error('Expected closing parenthesis');
//         }
        
//         consume(); // Consume the closing parenthesis
//         return expr;
//       }

//       throw new Error(`Unexpected token: ${token.value}`);
//     };

//     // Start parsing from the top level
//     const result = parseExpression();
    
//     if (!isAtEnd()) {
//       throw new Error(`Unexpected token after expression: ${peek().value}`);
//     }
    
//     return result;
//   };

//   // Convert AST to React Flow nodes and edges
//   const convertASTToFlowElements = useCallback((ast) => {
//     if (!ast) return { nodes: [], edges: [] };
    
//     const nodes = [];
//     const edges = [];
//     let nodeId = 0;
    
//     // Node type styling
//     const nodeTypes = {
//       'BinaryExpression': {
//         style: {
//           background: 'linear-gradient(to bottom right, #4F46E5, #7C3AED)',
//           color: 'white',
//           border: 'none',
//           width: 150,
//         },
//         className: 'rounded-xl shadow-lg'
//       },
//       'Identifier': {
//         style: {
//           background: 'linear-gradient(to bottom right, #10B981, #059669)',
//           color: 'white',
//           border: 'none',
//           width: 120,
//         },
//         className: 'rounded-xl shadow-lg'
//       },
//       'Literal': {
//         style: {
//           background: 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)',
//           color: 'white',
//           border: 'none',
//           width: 120,
//         },
//         className: 'rounded-xl shadow-lg'
//       }
//     };
    

//     // Helper function to recursively process nodes
//     const processNode = (node, depth = 0, x = 0) => {
//       if (!node) return null;
      
//       const currentId = `node-${nodeId++}`;
//       let label = '';
      
//       if (node.type === 'BinaryExpression') {
//         label = node.operator;
//       } else if (node.type === 'Identifier') {
//         label = node.name;
//       } else if (node.type === 'Literal') {
//         label = node.value.toString();
//       }
      
//       const nodeConfig = nodeTypes[node.type] || {
//         style: { 
//           background: '#6B7280', 
//           color: 'white', 
//           border: 'none', 
//           width: 120 
//         },
//         className: 'rounded-xl shadow-lg'
//       };
      
//       // Create the node
//       nodes.push({
//         id: currentId,
//         data: { 
//           label: (
//             <div className="text-center p-2">
//               <div className="font-bold text-lg">{label}</div>
//               <div className="text-xs opacity-80">{node.type}</div>
//             </div>
//           )
//         },
//         position: { x: x * 200, y: depth * 150 },
//         style: nodeConfig.style,
//         className: nodeConfig.className,
//         sourcePosition: 'bottom',
//         targetPosition: 'top',
//       });
      
//       // Process left child
//       if (node.left) {
//         const leftId = processNode(node.left, depth + 1, x - 1);
//         edges.push({
//           id: `edge-${currentId}-${leftId}`,
//           source: currentId,
//           target: leftId,
//           type: 'smoothstep',
//           animated: true,
//           markerEnd: {
//             type: MarkerType.ArrowClosed,
//             width: 20,
//             height: 20,
//             color: '#64748B',
//           },
//           style: { stroke: '#94A3B8', strokeWidth: 2 },
//         });
//       }
      
//       // Process right child
//       if (node.right) {
//         const rightId = processNode(node.right, depth + 1, x + 1);
//         edges.push({
//           id: `edge-${currentId}-${rightId}`,
//           source: currentId,
//           target: rightId,
//           type: 'smoothstep',
//           animated: true,
//           markerEnd: {
//             type: MarkerType.ArrowClosed,
//             width: 20,
//             height: 20,
//             color: '#64748B',
//           },
//           style: { stroke: '#94A3B8', strokeWidth: 2 },
//         });
//       }
      
//       return currentId;
//     };
    
//     processNode(ast);
    
//     return { nodes, edges };
//   }, []);

//   // Examples of expressions for demonstration
//   const examples = [
//     'a + b * c',
//     '(a + b) * c',
//     'x * (y + z) / 2',
//     'a + b + c',
//     'a * b * c',
//     '(a + b) * (c - d)',
//     '(x + y) * z / w',
//     'a * (b + c) * d',
//     '(p - q) / (r + s)',
//     'x + y * z / w',
//     '(a + b + c) * d',
//     'x * (y - z + w)'
//   ];

//   // Handle example selection
//   const handleExampleSelect = (example) => {
//     setInputCode(example);
//     setError('');
//     setParsedTree(null);
//     setNodes([]);
//     setEdges([]);
//   };

//   // Update flow elements when the AST changes
//   useEffect(() => {
//     if (parsedTree) {
//       const { nodes: newNodes, edges: newEdges } = convertASTToFlowElements(parsedTree);
//       setNodes(newNodes);
//       setEdges(newEdges);
//     }
//   }, [parsedTree, convertASTToFlowElements]);

//   // Create layout options for React Flow
//   const reactFlowStyle = {
//     background: '#F8FAFC',
//     width: '100%',
//     height: 500,
//   };

//   return (
//     <div className="container mx-auto p-6 max-w-6xl">
//       <div className="bg-white shadow-xl rounded-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
//           <h1 className="text-white text-3xl font-bold mb-2">
//             Syntax Tree Visualizer
//           </h1>
//           <p className="text-white opacity-90">
//             Visualize Abstract Syntax Trees (AST) for compiler design
//           </p>
//         </div>
        
//         <div className="p-6">
//           <div className="mb-6">
//             <label htmlFor="codeInput" className="block text-gray-700 font-semibold mb-2">
//               Enter Expression:
//             </label>
//             <div className="flex flex-col md:flex-row gap-4">
//               <textarea
//                 id="codeInput"
//                 value={inputCode}
//                 onChange={(e) => setInputCode(e.target.value)}
//                 className="flex-grow p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
//                 rows="2"
//                 placeholder="Enter a simple expression (e.g., a + b * c)"
//               />
//               <button
//                 onClick={parseCode}
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors whitespace-nowrap md:self-start"
//               >
//                 Generate AST
//               </button>
//             </div>

//             <div className="mt-4">
//               <p className="text-gray-700 font-semibold mb-2">Try examples:</p>
//               <div className="flex flex-wrap gap-2">
//                 {examples.map((example, index) => (
//                   <button
//                     key={index}
//                     onClick={() => handleExampleSelect(example)}
//                     className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm transition-colors border border-gray-300"
//                   >
//                     {example}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {error && (
//             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
//               <p className="font-bold">Error</p>
//               <p>{error}</p>
//             </div>
//           )}

//           <div className="border rounded-xl p-6 bg-white shadow-inner">
//             <h2 className="text-xl font-bold mb-4 text-gray-800">Abstract Syntax Tree</h2>
            
//             <div className="mb-2 text-sm text-gray-500 text-center">
//               Click "Generate AST" after modifying the expression to update the tree.
//             </div>
            
//             <div style={{ height: 500, width: '100%' }} className="bg-gray-50 rounded-lg border">
//               {nodes.length > 0 ? (
//                 <ReactFlow
//                   nodes={nodes}
//                   edges={edges}
//                   onNodesChange={onNodesChange}
//                   onEdgesChange={onEdgesChange}
//                   fitView
//                   attributionPosition="bottom-right"
//                   style={reactFlowStyle}
//                 >
//                   <Controls />
//                   <MiniMap />
//                   <Background variant="dots" gap={12} size={1} />
//                   <Panel position="top-right" className="bg-white p-2 rounded shadow text-xs text-gray-500">
//                     Drag to move | Scroll to zoom
//                   </Panel>
//                 </ReactFlow>
//               ) : (
//                 <div className="h-full flex items-center justify-center text-gray-500">
//                   <div className="text-center">
//                     <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                     </svg>
//                     <p className="mt-2">Enter an expression and click "Generate AST" to visualize the syntax tree</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
//             <h2 className="text-xl font-bold mb-2 text-gray-800">About Syntax Trees in Compiler Design</h2>
//             <p className="text-gray-700 mb-4">
//               In compiler design, an Abstract Syntax Tree (AST) is a tree representation of the syntactic structure of source code. Each node of the tree denotes a construct in the source code.
//             </p>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-white p-4 rounded-lg shadow-sm">
//                 <h3 className="font-bold text-gray-800 mb-2">Importance in Compilation</h3>
//                 <ul className="list-disc list-inside text-gray-700 space-y-1">
//                   <li>Intermediate representation between parsing and code generation</li>
//                   <li>Simplifies syntax analysis and semantic processing</li>
//                   <li>Facilitates code optimization techniques</li>
//                 </ul>
//               </div>
//               <div className="bg-white p-4 rounded-lg shadow-sm">
//                 <h3 className="font-bold text-gray-800 mb-2">Compiler Phases</h3>
//                 <ol className="list-decimal list-inside text-gray-700 space-y-1">
//                   <li>Lexical Analysis (Tokenization)</li>
//                   <li>Syntax Analysis (Parsing)</li>
//                   <li>Semantic Analysis</li>
//                   <li>Intermediate Code Generation</li>
//                   <li>Code Optimization</li>
//                   <li>Code Generation</li>
//                 </ol>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SyntaxTreeVisualizer;
import React, { useState } from 'react';

const GrammarAnalyzer = () => {
  const [grammar, setGrammar] = useState('E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('grammar');
  const [firstSets, setFirstSets] = useState({});
  const [followSets, setFollowSets] = useState({});
  const [parsingTable, setParsingTable] = useState({});
  const [testString, setTestString] = useState('id + id * id');
  const [parseResult, setParseResult] = useState('');
  const [ambiguityResults, setAmbiguityResults] = useState(null);
  const [leftRecursionResults, setLeftRecursionResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const parseGrammar = () => {
    setError('');
    try {
      // Parse grammar
      const parsedGrammar = {};
      const lines = grammar.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        const parts = line.split('->');
        if (parts.length !== 2) {
          throw new Error(`Invalid grammar rule: ${line}`);
        }
        
        const nonTerminal = parts[0].trim();
        const productions = parts[1].split('|').map(p => p.trim());
        
        if (!parsedGrammar[nonTerminal]) {
          parsedGrammar[nonTerminal] = [];
        }
        
        parsedGrammar[nonTerminal].push(...productions);
      }
      
      setResult(parsedGrammar);
      
      // Detect ambiguity (simplified check)
      const ambiguityCheck = checkAmbiguity(parsedGrammar);
      setAmbiguityResults(ambiguityCheck);
      
      // Detect left recursion
      const leftRecursionCheck = checkLeftRecursion(parsedGrammar);
      setLeftRecursionResults(leftRecursionCheck);
      
      // Generate suggestions
      const grammarSuggestions = generateSuggestions(parsedGrammar, ambiguityCheck, leftRecursionCheck);
      setSuggestions(grammarSuggestions);
      
      // Calculate FIRST and FOLLOW sets
      const first = calculateFirstSets(parsedGrammar);
      setFirstSets(first);
      
      const follow = calculateFollowSets(parsedGrammar, first);
      setFollowSets(follow);
      
      // Generate LL(1) parsing table
      const table = generateLL1Table(parsedGrammar, first, follow);
      setParsingTable(table);
      
      setStep('analysis');
    } catch (err) {
      setError(err.message);
    }
  };

  // Simplified check for ambiguity - looking for multiple epsilon productions
  const checkAmbiguity = (grammar) => {
    const results = {};
    
    for (const [nonTerminal, productions] of Object.entries(grammar)) {
      // Check for duplicate productions
      const uniqueProductions = new Set(productions);
      if (uniqueProductions.size !== productions.length) {
        results[nonTerminal] = 'Has duplicate productions';
      }
      
      // Check for multiple epsilon productions in a non-terminal
      const epsilonCount = productions.filter(p => p === 'ε' || p === '').length;
      if (epsilonCount > 1) {
        results[nonTerminal] = 'Has multiple epsilon productions';
      }
    }
    
    return Object.keys(results).length > 0 ? results : null;
  };

  // Check for left recursion
  const checkLeftRecursion = (grammar) => {
    const results = {};
    
    for (const [nonTerminal, productions] of Object.entries(grammar)) {
      for (const production of productions) {
        const firstSymbol = production.split(' ')[0];
        if (firstSymbol === nonTerminal) {
          results[nonTerminal] = 'Has direct left recursion';
          break;
        }
      }
    }
    
    return Object.keys(results).length > 0 ? results : null;
  };

  // Calculate FIRST sets
  const calculateFirstSets = (grammar) => {
    const first = {};
    
    // Initialize FIRST sets for all non-terminals
    for (const nonTerminal of Object.keys(grammar)) {
      first[nonTerminal] = new Set();
    }
    
    let changed = true;
    while (changed) {
      changed = false;
      
      for (const [nonTerminal, productions] of Object.entries(grammar)) {
        for (const production of productions) {
          if (production === 'ε' || production === '') {
            // Add epsilon to FIRST set
            if (!first[nonTerminal].has('ε')) {
              first[nonTerminal].add('ε');
              changed = true;
            }
          } else {
            const symbols = production.split(' ');
            const firstSymbol = symbols[0];
            
            if (!Object.keys(grammar).includes(firstSymbol)) {
              // Terminal symbol
              if (!first[nonTerminal].has(firstSymbol)) {
                first[nonTerminal].add(firstSymbol);
                changed = true;
              }
            } else {
              // Non-terminal symbol
              for (const symbol of first[firstSymbol]) {
                if (symbol !== 'ε' && !first[nonTerminal].has(symbol)) {
                  first[nonTerminal].add(symbol);
                  changed = true;
                }
              }
            }
          }
        }
      }
    }
    
    // Convert Sets to Arrays for easier display/manipulation
    const result = {};
    for (const [key, value] of Object.entries(first)) {
      result[key] = Array.from(value);
    }
    
    return result;
  };

  // Calculate FOLLOW sets
  const calculateFollowSets = (grammar, firstSets) => {
    const follow = {};
    const startSymbol = Object.keys(grammar)[0]; // Assuming first non-terminal is start symbol
    
    // Initialize FOLLOW sets for all non-terminals
    for (const nonTerminal of Object.keys(grammar)) {
      follow[nonTerminal] = new Set();
    }
    
    // Add $ to FOLLOW(S) where S is the start symbol
    follow[startSymbol].add('$');
    
    let changed = true;
    while (changed) {
      changed = false;
      
      for (const [nonTerminal, productions] of Object.entries(grammar)) {
        for (const production of productions) {
          const symbols = production.split(' ');
          
          for (let i = 0; i < symbols.length; i++) {
            const currentSymbol = symbols[i];
            
            // If current symbol is a non-terminal
            if (Object.keys(grammar).includes(currentSymbol)) {
              // If this is the last symbol
              if (i === symbols.length - 1) {
                // Add FOLLOW(nonTerminal) to FOLLOW(currentSymbol)
                for (const symbol of follow[nonTerminal]) {
                  if (!follow[currentSymbol].has(symbol)) {
                    follow[currentSymbol].add(symbol);
                    changed = true;
                  }
                }
              } else {
                const nextSymbol = symbols[i + 1];
                
                // If next symbol is a terminal
                if (!Object.keys(grammar).includes(nextSymbol)) {
                  if (!follow[currentSymbol].has(nextSymbol)) {
                    follow[currentSymbol].add(nextSymbol);
                    changed = true;
                  }
                } else {
                  // Next symbol is a non-terminal
                  // Add FIRST(nextSymbol) to FOLLOW(currentSymbol)
                  for (const symbol of firstSets[nextSymbol]) {
                    if (symbol !== 'ε' && !follow[currentSymbol].has(symbol)) {
                      follow[currentSymbol].add(symbol);
                      changed = true;
                    }
                  }
                  
                  // If FIRST(nextSymbol) contains epsilon
                  if (firstSets[nextSymbol].includes('ε')) {
                    // Add FOLLOW(nonTerminal) to FOLLOW(currentSymbol)
                    for (const symbol of follow[nonTerminal]) {
                      if (!follow[currentSymbol].has(symbol)) {
                        follow[currentSymbol].add(symbol);
                        changed = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Convert Sets to Arrays for easier display/manipulation
    const result = {};
    for (const [key, value] of Object.entries(follow)) {
      result[key] = Array.from(value);
    }
    
    return result;
  };

  // Generate LL(1) parsing table
  const generateLL1Table = (grammar, firstSets, followSets) => {
    const table = {};
    const terminals = new Set();
    
    // Find all terminals
    for (const productions of Object.values(grammar)) {
      for (const production of productions) {
        const symbols = production.split(' ');
        for (const symbol of symbols) {
          if (!Object.keys(grammar).includes(symbol) && symbol !== 'ε' && symbol !== '') {
            terminals.add(symbol);
          }
        }
      }
    }
    
    // Add end marker
    terminals.add('$');
    const terminalsArray = Array.from(terminals);
    
    // Initialize table
    for (const nonTerminal of Object.keys(grammar)) {
      table[nonTerminal] = {};
      for (const terminal of terminalsArray) {
        table[nonTerminal][terminal] = [];
      }
    }
    
    // Fill the table
    for (const [nonTerminal, productions] of Object.entries(grammar)) {
      for (const production of productions) {
        const symbols = production.split(' ');
        const firstSymbol = symbols[0];
        
        if (firstSymbol === 'ε' || firstSymbol === '') {
          // For epsilon production, use FOLLOW set
          for (const terminal of followSets[nonTerminal]) {
            table[nonTerminal][terminal].push('ε');
          }
        } else if (!Object.keys(grammar).includes(firstSymbol)) {
          // Terminal as first symbol
          if (terminalsArray.includes(firstSymbol)) {
            table[nonTerminal][firstSymbol].push(production);
          }
        } else {
          // Non-terminal as first symbol
          for (const terminal of firstSets[firstSymbol]) {
            if (terminal !== 'ε' && terminalsArray.includes(terminal)) {
              table[nonTerminal][terminal].push(production);
            }
          }
          
          // If epsilon in FIRST(firstSymbol), use FOLLOW set
          if (firstSets[firstSymbol].includes('ε')) {
            for (const terminal of followSets[nonTerminal]) {
              if (terminalsArray.includes(terminal)) {
                table[nonTerminal][terminal].push(production);
              }
            }
          }
        }
      }
    }
    
    return { table, terminals: terminalsArray, nonTerminals: Object.keys(grammar) };
  };

  // Generate grammar improvement suggestions
  const generateSuggestions = (grammar, ambiguityResults, leftRecursionResults) => {
    const suggestions = [];
    
    if (ambiguityResults) {
      suggestions.push({
        title: "Fix Grammar Ambiguity",
        description: "Your grammar appears to be ambiguous. Consider rewriting the productions to eliminate ambiguity.",
        examples: [
          "Original: E -> E + E | E * E | id",
          "Improved: E -> E + T | T\nT -> T * F | F\nF -> id"
        ]
      });
    }
    
    if (leftRecursionResults) {
      suggestions.push({
        title: "Eliminate Left Recursion",
        description: "Your grammar contains left recursion which can cause problems for top-down parsing.",
        examples: [
          "Original: A -> A α | β",
          "Improved: A -> β A'\nA' -> α A' | ε"
        ]
      });
    }
    
    // Check for left factoring opportunities
    for (const [nonTerminal, productions] of Object.entries(grammar)) {
      const prefixes = {};
      
      for (const production of productions) {
        const firstSymbol = production.split(' ')[0];
        if (firstSymbol !== 'ε' && firstSymbol !== '') {
          if (!prefixes[firstSymbol]) {
            prefixes[firstSymbol] = [];
          }
          prefixes[firstSymbol].push(production);
        }
      }
      
      for (const [prefix, prods] of Object.entries(prefixes)) {
        if (prods.length > 1) {
          suggestions.push({
            title: "Apply Left Factoring",
            description: `Multiple productions for ${nonTerminal} start with the same prefix '${prefix}'. Consider left factoring to improve parsing efficiency.`,
            examples: [
              `Original: ${nonTerminal} -> ${prods.join(' | ')}`,
              `Improved: ${nonTerminal} -> ${prefix} ${nonTerminal}'\n${nonTerminal}' -> ${prods.map(p => p.substring(prefix.length + 1) || 'ε').join(' | ')}`
            ]
          });
          break;
        }
      }
    }
    
    return suggestions;
  };

  // Test string parsing using LL(1) table
  const parseTestString = () => {
    try {
      const table = parsingTable.table;
      const input = testString.split(' ');
      input.push('$'); // Add end marker
      
      const stack = ['$'];
      const startSymbol = Object.keys(result)[0]; // Assuming first rule is start symbol
      stack.push(startSymbol);
      
      let inputPos = 0;
      let parseSteps = [];
      
      while (stack.length > 0) {
        const stackTop = stack[stack.length - 1];
        const currentInput = input[inputPos];
        
        parseSteps.push(`Stack: ${stack.join(' ')}, Input: ${input.slice(inputPos).join(' ')}`);
        
        if (stackTop === '$' && currentInput === '$') {
          parseSteps.push('Accepted!');
          setParseResult(parseSteps.join('\n'));
          return;
        }
        
        if (!Object.keys(result).includes(stackTop)) {
          // Terminal on top of stack
          if (stackTop === currentInput) {
            stack.pop();
            inputPos++;
          } else {
            throw new Error(`Expected ${stackTop}, found ${currentInput}`);
          }
        } else {
          // Non-terminal on top of stack
          if (!table[stackTop][currentInput] || table[stackTop][currentInput].length === 0) {
            throw new Error(`No production for ${stackTop} with input ${currentInput}`);
          }
          
          const production = table[stackTop][currentInput][0];
          stack.pop();
          
          if (production !== 'ε' && production !== '') {
            // Push production symbols in reverse order
            const symbols = production.split(' ').reverse();
            for (const symbol of symbols) {
              stack.push(symbol);
            }
          }
        }
      }
      
      throw new Error('Unexpected end of parsing');
    } catch (err) {
      setParseResult(`Error: ${err.message}`);
    }
  };

  const renderAnalysisResults = () => {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Parsed Grammar</h3>
          <div className="bg-white p-3 rounded border">
            {Object.entries(result).map(([nonTerminal, productions]) => (
              <div key={nonTerminal} className="mb-2">
                <span className="font-mono">{nonTerminal} → {productions.join(' | ')}</span>
              </div>
            ))}
          </div>
        </div>
        
        {ambiguityResults && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Ambiguity Detection</h3>
            <div className="bg-white p-3 rounded border">
              {Object.entries(ambiguityResults).map(([nonTerminal, issue]) => (
                <div key={nonTerminal} className="mb-1 text-yellow-700">
                  <span className="font-mono">{nonTerminal}</span>: {issue}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {leftRecursionResults && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Left Recursion Detection</h3>
            <div className="bg-white p-3 rounded border">
              {Object.entries(leftRecursionResults).map(([nonTerminal, issue]) => (
                <div key={nonTerminal} className="mb-1 text-yellow-700">
                  <span className="font-mono">{nonTerminal}</span>: {issue}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">FIRST Sets</h3>
          <div className="bg-white p-3 rounded border">
            {Object.entries(firstSets).map(([nonTerminal, symbols]) => (
              <div key={nonTerminal} className="mb-1">
                <span className="font-mono">FIRST({nonTerminal}) = {`{${symbols.join(', ')}}`}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">FOLLOW Sets</h3>
          <div className="bg-white p-3 rounded border">
            {Object.entries(followSets).map(([nonTerminal, symbols]) => (
              <div key={nonTerminal} className="mb-1">
                <span className="font-mono">FOLLOW({nonTerminal}) = {`{${symbols.join(', ')}}`}</span>
              </div>
            ))}
          </div>
        </div>
        
        {suggestions.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Grammar Improvement Suggestions</h3>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-green-700">{suggestion.title}</h4>
                  <p className="my-2">{suggestion.description}</p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                    {suggestion.examples.map((example, i) => (
                      <div key={i}>{example}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">LL(1) Parsing Table</h3>
          {renderLL1Table()}
        </div>
        
        
        
        <div className="flex justify-between">
          <button
            onClick={() => setStep('grammar')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Grammar Input
          </button>
        </div>
      </div>
    );
  };

  // Render the LL(1) parsing table
  const renderLL1Table = () => {
    const { table, terminals, nonTerminals } = parsingTable;
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-purple-100">
              <th className="border p-2">Non-Terminal</th>
              {terminals.map(terminal => (
                <th key={terminal} className="border p-2">{terminal}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map(nonTerminal => (
              <tr key={nonTerminal}>
                <td className="border p-2 font-medium">{nonTerminal}</td>
                {terminals.map(terminal => (
                  <td key={terminal} className="border p-2 text-center font-mono">
                    {table[nonTerminal][terminal].length > 0 
                      ? table[nonTerminal][terminal].join(', ') 
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-3xl font-bold mb-2">Grammar Analyzer & LL(1) Parser Generator</h1>
        <p className="text-lg">
          An interactive tool to analyze context-free grammars and generate LL(1) parsing tables
        </p>
      </div>
      
      {step === 'grammar' ? (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Grammar Input</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Enter your grammar (one rule per line, using -&gt for productions and | for alternatives)</label>
            <textarea
              value={grammar}
              onChange={(e) => setGrammar(e.target.value)}
              className="w-full p-3 border rounded font-mono h-40"
              placeholder="E -> E + T | T&#10;T -> T * F | F&#10;F -> id | ( E )"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={parseGrammar}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              Analyze Grammar
            </button>
          </div>
        </div>
      ) : (
        renderAnalysisResults()
      )}
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Grammar Analyzer and LL(1) Parser Generator - A Compiler Design Project</p>
      </div>
    </div>
  );
};

export default GrammarAnalyzer;