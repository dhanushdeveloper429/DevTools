import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, Play, Wand2, Code, TestTube, Lightbulb, BookOpen, Puzzle, Eye, Layers, Zap, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegexGenerator = () => {
  const [selectedPattern, setSelectedPattern] = useState("");
  const [customRegex, setCustomRegex] = useState("");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [flags, setFlags] = useState("g");
  const [playgroundMode, setPlaygroundMode] = useState("builder");
  const [currentTutorial, setCurrentTutorial] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [highlightedMatch, setHighlightedMatch] = useState<number>(-1);
  const [performanceResults, setPerformanceResults] = useState<any>(null);
  const [benchmarkData, setBenchmarkData] = useState<any[]>([]);
  const { toast } = useToast();

  const tutorials = [
    {
      title: "Basic Character Matching",
      description: "Learn how to match specific characters and character sets",
      pattern: "[a-z]+",
      testText: "Hello World 123",
      explanation: "This pattern matches one or more lowercase letters. [a-z] creates a character class for any lowercase letter, and + means one or more repetitions."
    },
    {
      title: "Digit Recognition",
      description: "Understanding how to match numbers and digits",
      pattern: "\\d{2,4}",
      testText: "Call me at 555-1234 or 123-45-6789",
      explanation: "\\d matches any digit (0-9), and {2,4} means between 2 and 4 repetitions. This finds number sequences of 2-4 digits."
    },
    {
      title: "Email Pattern Basics",
      description: "Building a simple email validation pattern",
      pattern: "\\w+@\\w+\\.\\w+",
      testText: "Contact us at support@example.com or info@test.org",
      explanation: "\\w+ matches word characters (letters, digits, underscore), @ matches literally, \\. escapes the dot to match a literal period."
    },
    {
      title: "Optional Groups",
      description: "Using question marks for optional matching",
      pattern: "colou?r",
      testText: "I like the color red and the colour blue",
      explanation: "The ? after 'u' makes it optional, so this pattern matches both 'color' and 'colour'."
    },
    {
      title: "Anchors and Boundaries",
      description: "Using ^ and $ to match start and end positions",
      pattern: "^Hello.*world$",
      testText: "Hello beautiful world",
      explanation: "^ anchors to start of string, $ anchors to end, .* matches any characters in between. The entire string must match this pattern."
    }
  ];

  const patternComponents = [
    { name: "Any Character", symbol: ".", description: "Matches any single character except newline" },
    { name: "Word Character", symbol: "\\w", description: "Matches letters, digits, and underscore" },
    { name: "Digit", symbol: "\\d", description: "Matches any digit 0-9" },
    { name: "Whitespace", symbol: "\\s", description: "Matches space, tab, newline" },
    { name: "Start of String", symbol: "^", description: "Anchors match to beginning of string" },
    { name: "End of String", symbol: "$", description: "Anchors match to end of string" },
    { name: "One or More", symbol: "+", description: "Matches one or more of the preceding element" },
    { name: "Zero or More", symbol: "*", description: "Matches zero or more of the preceding element" },
    { name: "Optional", symbol: "?", description: "Makes the preceding element optional" },
    { name: "Character Class", symbol: "[a-z]", description: "Matches any character within the brackets" },
    { name: "NOT Character Class", symbol: "[^a-z]", description: "Matches any character NOT in the brackets" },
    { name: "Escape", symbol: "\\", description: "Escapes special characters to match them literally" }
  ];

  const regexPatterns = [
    {
      name: "Email Address",
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      description: "Validates standard email addresses",
      example: "user@example.com"
    },
    {
      name: "Phone Number (US)",
      pattern: "^(\\+1-?)?\\(?[0-9]{3}\\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$",
      description: "Matches US phone numbers in various formats",
      example: "(555) 123-4567"
    },
    {
      name: "URL/Website",
      pattern: "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$",
      description: "Validates HTTP and HTTPS URLs",
      example: "https://www.example.com"
    },
    {
      name: "Credit Card Number",
      pattern: "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$",
      description: "Validates major credit card formats",
      example: "4111111111111111"
    },
    {
      name: "Password (Strong)",
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      description: "At least 8 chars with uppercase, lowercase, digit, and special char",
      example: "MyPass123!"
    },
    {
      name: "IP Address (IPv4)",
      pattern: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
      description: "Validates IPv4 addresses",
      example: "192.168.1.1"
    },
    {
      name: "Date (MM/DD/YYYY)",
      pattern: "^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/(19|20)\\d\\d$",
      description: "Matches dates in MM/DD/YYYY format",
      example: "12/25/2024"
    },
    {
      name: "Time (24-hour)",
      pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
      description: "Matches time in 24-hour format",
      example: "14:30"
    },
    {
      name: "Hex Color Code",
      pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
      description: "Matches hex color codes",
      example: "#FF5733"
    },
    {
      name: "Username",
      pattern: "^[a-zA-Z0-9_]{3,20}$",
      description: "3-20 characters, letters, numbers, and underscores only",
      example: "user_123"
    },
    {
      name: "Postal Code (US)",
      pattern: "^\\d{5}(-\\d{4})?$",
      description: "US ZIP codes (5 digits or ZIP+4)",
      example: "12345-6789"
    },
    {
      name: "Social Security Number",
      pattern: "^\\d{3}-\\d{2}-\\d{4}$",
      description: "US SSN format (XXX-XX-XXXX)",
      example: "123-45-6789"
    }
  ];

  const flagOptions = [
    { value: "g", label: "Global (g)", description: "Find all matches" },
    { value: "i", label: "Ignore Case (i)", description: "Case insensitive" },
    { value: "m", label: "Multiline (m)", description: "^ and $ match line boundaries" },
    { value: "gi", label: "Global + Ignore Case", description: "Combine g and i flags" },
    { value: "gm", label: "Global + Multiline", description: "Combine g and m flags" },
    { value: "gim", label: "All Flags", description: "Global, case insensitive, multiline" }
  ];

  const handlePatternSelect = (pattern: string) => {
    const selectedPatternObj = regexPatterns.find(p => p.pattern === pattern);
    if (selectedPatternObj) {
      setSelectedPattern(pattern);
      setCustomRegex(pattern);
      setTestString(selectedPatternObj.example);
    }
  };

  const explainRegex = (pattern: string) => {
    const explanations: { [key: string]: string } = {
      '.': 'matches any character',
      '\\d': 'matches any digit (0-9)',
      '\\w': 'matches word characters (letters, digits, underscore)',
      '\\s': 'matches whitespace (space, tab, newline)',
      '+': 'one or more of the preceding element',
      '*': 'zero or more of the preceding element',
      '?': 'zero or one of the preceding element (optional)',
      '^': 'anchors to start of string',
      '$': 'anchors to end of string',
      '[a-z]': 'matches any lowercase letter',
      '[A-Z]': 'matches any uppercase letter',
      '[0-9]': 'matches any digit',
      '|': 'OR operator (alternation)',
      '()': 'creates a capturing group',
      '\\': 'escapes the next character'
    };

    let explanation = "Pattern breakdown:\n";
    const parts = pattern.split(/(\\.|\[.*?\]|\{.*?\}|\(.*?\))/);
    
    parts.forEach(part => {
      if (part && explanations[part]) {
        explanation += `• ${part} - ${explanations[part]}\n`;
      }
    });

    return explanation;
  };

  const translateToNaturalLanguage = (pattern: string): string => {
    if (!pattern) return "No pattern to translate";

    try {
      // Clean and normalize the pattern
      let translation = "This pattern ";
      
      // Handle anchors
      const startsWithCaret = pattern.startsWith('^');
      const endsWithDollar = pattern.endsWith('$');
      
      if (startsWithCaret && endsWithDollar) {
        translation += "matches the entire string that ";
        pattern = pattern.slice(1, -1);
      } else if (startsWithCaret) {
        translation += "matches text at the beginning that ";
        pattern = pattern.slice(1);
      } else if (endsWithDollar) {
        translation += "matches text at the end that ";
        pattern = pattern.slice(0, -1);
      } else {
        translation += "finds text that ";
      }

      // Parse the pattern into meaningful segments
      const segments = parseRegexSegments(pattern);
      const descriptions = segments.map(segment => segmentToNaturalLanguage(segment));
      
      if (descriptions.length === 1) {
        translation += descriptions[0];
      } else if (descriptions.length === 2) {
        translation += descriptions[0] + " followed by " + descriptions[1];
      } else {
        const last = descriptions.pop();
        translation += descriptions.join(", followed by ") + ", and finally " + last;
      }

      return translation + ".";
    } catch (error) {
      return "Unable to translate this pattern - it may be too complex or contain unsupported syntax.";
    }
  };

  const parseRegexSegments = (pattern: string): Array<{type: string, value: string, quantifier?: string}> => {
    const segments = [];
    let i = 0;
    
    while (i < pattern.length) {
      let segment = { type: 'literal', value: '', quantifier: '' };
      
      if (pattern[i] === '\\') {
        // Escaped character
        if (i + 1 < pattern.length) {
          const nextChar = pattern[i + 1];
          if (nextChar === 'd') {
            segment = { type: 'digit', value: '\\d' };
          } else if (nextChar === 'w') {
            segment = { type: 'word', value: '\\w' };
          } else if (nextChar === 's') {
            segment = { type: 'whitespace', value: '\\s' };
          } else {
            segment = { type: 'literal', value: nextChar };
          }
          i += 2;
        } else {
          i++;
        }
      } else if (pattern[i] === '[') {
        // Character class
        let j = i + 1;
        while (j < pattern.length && pattern[j] !== ']') j++;
        segment = { type: 'charclass', value: pattern.slice(i, j + 1) };
        i = j + 1;
      } else if (pattern[i] === '(') {
        // Group
        let depth = 1;
        let j = i + 1;
        while (j < pattern.length && depth > 0) {
          if (pattern[j] === '(') depth++;
          if (pattern[j] === ')') depth--;
          j++;
        }
        segment = { type: 'group', value: pattern.slice(i, j) };
        i = j;
      } else if (pattern[i] === '.') {
        segment = { type: 'any', value: '.' };
        i++;
      } else {
        // Regular character
        segment = { type: 'literal', value: pattern[i] };
        i++;
      }
      
      // Check for quantifiers
      if (i < pattern.length) {
        if (pattern[i] === '+') {
          segment.quantifier = '+';
          i++;
        } else if (pattern[i] === '*') {
          segment.quantifier = '*';
          i++;
        } else if (pattern[i] === '?') {
          segment.quantifier = '?';
          i++;
        } else if (pattern[i] === '{') {
          let j = i;
          while (j < pattern.length && pattern[j] !== '}') j++;
          segment.quantifier = pattern.slice(i, j + 1);
          i = j + 1;
        }
      }
      
      segments.push(segment);
    }
    
    return segments;
  };

  const segmentToNaturalLanguage = (segment: {type: string, value: string, quantifier?: string}): string => {
    let base = "";
    
    switch (segment.type) {
      case 'digit':
        base = "a digit";
        break;
      case 'word':
        base = "a word character (letter, digit, or underscore)";
        break;
      case 'whitespace':
        base = "a whitespace character";
        break;
      case 'any':
        base = "any character";
        break;
      case 'literal':
        base = `the character "${segment.value}"`;
        break;
      case 'charclass':
        base = describeCharacterClass(segment.value);
        break;
      case 'group':
        base = `a group containing: ${translateToNaturalLanguage(segment.value.slice(1, -1))}`;
        break;
      default:
        base = segment.value;
    }
    
    // Add quantifier description
    if (segment.quantifier) {
      switch (segment.quantifier) {
        case '+':
          return `one or more ${base}s`;
        case '*':
          return `zero or more ${base}s`;
        case '?':
          return `optionally ${base}`;
        default:
          if (segment.quantifier.startsWith('{')) {
            const match = segment.quantifier.match(/\{(\d+)(?:,(\d+))?\}/);
            if (match) {
              const min = match[1];
              const max = match[2];
              if (max) {
                return `between ${min} and ${max} ${base}s`;
              } else {
                return `exactly ${min} ${base}s`;
              }
            }
          }
          return base + segment.quantifier;
      }
    }
    
    return base;
  };

  const describeCharacterClass = (charClass: string): string => {
    const inner = charClass.slice(1, -1);
    
    if (inner === 'a-z') return "a lowercase letter";
    if (inner === 'A-Z') return "an uppercase letter";
    if (inner === '0-9') return "a digit";
    if (inner === 'a-zA-Z') return "a letter";
    if (inner === 'a-zA-Z0-9') return "a letter or digit";
    if (inner.startsWith('^')) return `any character except those in [${inner.slice(1)}]`;
    
    // Handle common patterns
    if (inner.includes('-')) {
      const ranges = inner.split('');
      return `a character in the range [${inner}]`;
    }
    
    return `one of the characters: ${inner.split('').join(', ')}`;
  };

  const testRegex = () => {
    try {
      if (!customRegex.trim()) {
        setMatches([]);
        setExplanation("");
        return;
      }

      const regex = new RegExp(customRegex, flags);
      setIsValid(true);
      setExplanation(explainRegex(customRegex));
      
      if (flags.includes('g')) {
        const allMatches = testString.match(regex) || [];
        setMatches(allMatches);
      } else {
        const match = testString.match(regex);
        setMatches(match ? [match[0]] : []);
      }
    } catch (error) {
      setIsValid(false);
      setMatches([]);
      setExplanation("Invalid regex pattern");
    }
  };

  const addPatternComponent = (symbol: string) => {
    setCustomRegex(prev => prev + symbol);
  };

  const loadTutorial = (index: number) => {
    const tutorial = tutorials[index];
    setCurrentTutorial(index);
    setCustomRegex(tutorial.pattern);
    setTestString(tutorial.testText);
    setExplanation(tutorial.explanation);
    setTimeout(() => testRegex(), 100);
  };

  useEffect(() => {
    if (customRegex && testString) {
      testRegex();
    }
  }, [customRegex, testString, flags]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const escapeRegex = (text: string) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const generateFromText = () => {
    if (testString.trim()) {
      const escaped = escapeRegex(testString.trim());
      setCustomRegex(escaped);
    }
  };

  const analyzePerformance = () => {
    try {
      if (!customRegex.trim() || !testString.trim()) {
        return;
      }

      const regex = new RegExp(customRegex, flags);
      const iterations = 1000;
      let totalTime = 0;
      let matches = 0;

      // Warm up
      for (let i = 0; i < 10; i++) {
        testString.match(regex);
      }

      // Benchmark
      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        const result = testString.match(regex);
        if (result) matches++;
      }
      const endTime = performance.now();
      totalTime = endTime - startTime;

      const avgTime = totalTime / iterations;
      const complexityScore = calculateComplexity(customRegex);
      const warnings = getPerformanceWarnings(customRegex);
      const suggestions = getOptimizationSuggestions(customRegex);

      const results = {
        avgExecutionTime: avgTime,
        totalTime,
        iterations,
        matchCount: matches,
        complexityScore,
        warnings,
        suggestions,
        pattern: customRegex,
        flags,
        testStringLength: testString.length
      };

      setPerformanceResults(results);

      // Add to benchmark history
      setBenchmarkData(prev => [
        ...prev.slice(-9), // Keep last 9 results
        {
          pattern: customRegex,
          avgTime,
          complexity: complexityScore,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Unable to analyze pattern performance",
        variant: "destructive",
      });
    }
  };

  const calculateComplexity = (pattern: string): number => {
    let score = 1;
    
    // Quantifiers increase complexity
    const quantifiers = (pattern.match(/[*+?{]/g) || []).length;
    score += quantifiers * 2;
    
    // Nested groups increase complexity
    const groups = (pattern.match(/\(/g) || []).length;
    score += groups * 1.5;
    
    // Alternation increases complexity
    const alternations = (pattern.match(/\|/g) || []).length;
    score += alternations * 2;
    
    // Lookaheads/lookbehinds are expensive
    const lookarounds = (pattern.match(/\?\=/g) || []).length + 
                       (pattern.match(/\?\!/g) || []).length +
                       (pattern.match(/\?\<=/g) || []).length +
                       (pattern.match(/\?\<!/g) || []).length;
    score += lookarounds * 5;
    
    // Backtracking potential
    if (pattern.includes('.*') || pattern.includes('.+')) {
      score += 3;
    }
    
    return Math.min(score, 10); // Cap at 10
  };

  const getPerformanceWarnings = (pattern: string): string[] => {
    const warnings = [];
    
    if (pattern.includes('.*.*') || pattern.includes('.+.+')) {
      warnings.push("Multiple greedy quantifiers may cause excessive backtracking");
    }
    
    if (pattern.includes('(.*)')) {
      warnings.push("Capturing groups with .* can be slow on large texts");
    }
    
    if (pattern.match(/\[.*\-.*\]/)) {
      warnings.push("Large character ranges in character classes may impact performance");
    }
    
    if (pattern.includes('|') && pattern.length > 50) {
      warnings.push("Complex alternation patterns may slow down matching");
    }
    
    if ((pattern.match(/\(/g) || []).length > 5) {
      warnings.push("Many capturing groups can reduce performance");
    }
    
    return warnings;
  };

  const getOptimizationSuggestions = (pattern: string): string[] => {
    const suggestions = [];
    
    if (pattern.includes('.*')) {
      suggestions.push("Consider using more specific patterns instead of .* when possible");
    }
    
    if (pattern.includes('(.*)') && !pattern.includes('\\1')) {
      suggestions.push("Use non-capturing groups (?:...) if you don't need to capture");
    }
    
    if (pattern.includes('[a-zA-Z]')) {
      suggestions.push("Consider using \\w if you want word characters including digits");
    }
    
    if (pattern.includes('[0-9]')) {
      suggestions.push("Use \\d instead of [0-9] for better readability and performance");
    }
    
    if (pattern.includes('+') && !pattern.includes('?')) {
      suggestions.push("Consider using possessive quantifiers *+ or ++ to prevent backtracking");
    }
    
    return suggestions;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Interactive Regex Pattern Playground
          </CardTitle>
          <CardDescription>
            Learn, build, and test regular expressions with interactive tutorials and visual pattern building
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={playgroundMode} onValueChange={setPlaygroundMode} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Puzzle className="h-4 w-4" />
            Pattern Builder
          </TabsTrigger>
          <TabsTrigger value="tutorial" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Interactive Tutorial
          </TabsTrigger>
          <TabsTrigger value="visualizer" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Tester
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Pattern Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutorial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Step-by-Step Regex Tutorial
              </CardTitle>
              <CardDescription>
                Learn regex concepts through interactive examples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {tutorials.map((tutorial, index) => (
                  <Button
                    key={index}
                    variant={currentTutorial === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => loadTutorial(index)}
                    className="text-xs p-2 h-auto"
                    data-testid={`tutorial-${index}`}
                  >
                    <div className="text-center">
                      <div className="font-medium">{index + 1}</div>
                      <div className="text-xs opacity-80">{tutorial.title}</div>
                    </div>
                  </Button>
                ))}
              </div>

              {currentTutorial >= 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      {tutorials[currentTutorial].title}
                    </h4>
                    <p className="text-blue-800 text-sm">
                      {tutorials[currentTutorial].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Pattern</label>
                      <div className="p-3 bg-gray-100 rounded font-mono text-sm">
                        /{customRegex}/{flags}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Test Text</label>
                      <div className="p-3 bg-gray-100 rounded text-sm">
                        {testString}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Explanation</h5>
                    <p className="text-green-800 text-sm whitespace-pre-line">
                      {explanation}
                    </p>
                  </div>

                  {matches.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Matches Found ({matches.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {matches.map((match, index) => (
                          <Badge key={index} variant="secondary" className="font-mono">
                            {match}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="h-5 w-5" />
                Visual Pattern Builder
              </CardTitle>
              <CardDescription>
                Build regex patterns by clicking components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Pattern Components</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {patternComponents.map((component, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addPatternComponent(component.symbol)}
                      className="flex flex-col items-center p-2 h-auto"
                      data-testid={`component-${component.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <code className="font-mono font-bold">{component.symbol}</code>
                      <span className="text-xs">{component.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Current Pattern</label>
                <div className="flex gap-2">
                  <Input
                    value={customRegex}
                    onChange={(e) => setCustomRegex(e.target.value)}
                    className="font-mono"
                    placeholder="Build your pattern..."
                    data-testid="input-pattern-builder"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setCustomRegex("")}
                    data-testid="button-clear-pattern"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {patternComponents.slice(0, 4).map((component, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-center">
                    <code className="font-mono font-bold text-sm">{component.symbol}</code>
                    <p className="text-xs text-gray-600 mt-1">{component.description}</p>
                  </div>
                ))}
              </div>

              {/* Real-time Natural Language Translation */}
              {customRegex && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wand2 className="h-4 w-4 text-green-500" />
                      Live Translation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-900 text-sm leading-relaxed">
                        {translateToNaturalLanguage(customRegex)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">Updates as you build</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(translateToNaturalLanguage(customRegex), "Pattern explanation")}
                        data-testid="button-copy-live-translation"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visual Regex Tester
              </CardTitle>
              <CardDescription>
                Test your patterns with visual highlighting and detailed feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Regex Pattern</label>
                  <div className="flex gap-2">
                    <Input
                      value={customRegex}
                      onChange={(e) => setCustomRegex(e.target.value)}
                      className={`font-mono ${!isValid ? 'border-red-500' : ''}`}
                      placeholder="Enter your regex pattern..."
                      data-testid="input-visual-regex"
                    />
                    <Select value={flags} onValueChange={setFlags}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {flagOptions.map((flag) => (
                          <SelectItem key={flag.value} value={flag.value}>
                            {flag.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Test String</label>
                  <Textarea
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    className="min-h-[100px] font-mono"
                    placeholder="Enter text to test..."
                    data-testid="textarea-visual-test"
                  />
                </div>
              </div>

              <Button
                onClick={testRegex}
                className="w-full"
                disabled={!customRegex.trim() || !testString.trim()}
                data-testid="button-visual-test"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Pattern
              </Button>

              {customRegex && (
                <div className="space-y-4">
                  {/* Natural Language Translation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wand2 className="h-5 w-5 text-purple-500" />
                        Natural Language Translation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-purple-900 text-sm leading-relaxed">
                          {translateToNaturalLanguage(customRegex)}
                        </p>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(translateToNaturalLanguage(customRegex), "Natural language explanation")}
                          data-testid="button-copy-translation"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Translation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technical Explanation */}
                  {explanation && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Technical Breakdown</h5>
                      <pre className="text-blue-800 text-sm whitespace-pre-wrap">{explanation}</pre>
                    </div>
                  )}
                </div>
              )}

              {matches.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block">
                    Matches ({matches.length})
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {matches.map((match, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          highlightedMatch === index 
                            ? 'bg-yellow-100 border-yellow-400' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setHighlightedMatch(highlightedMatch === index ? -1 : index)}
                        onMouseEnter={() => setHighlightedMatch(index)}
                        onMouseLeave={() => setHighlightedMatch(-1)}
                        data-testid={`match-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{match}</span>
                          <Badge variant="secondary">Match {index + 1}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Regex Performance Analyzer
              </CardTitle>
              <CardDescription>
                Analyze and optimize your regex patterns for better performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Pattern to Analyze</label>
                  <Input
                    value={customRegex}
                    onChange={(e) => setCustomRegex(e.target.value)}
                    className="font-mono"
                    placeholder="Enter regex pattern to analyze..."
                    data-testid="input-performance-regex"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Test Data</label>
                  <Input
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter test string..."
                    data-testid="input-performance-test"
                  />
                </div>
              </div>

              <Button
                onClick={analyzePerformance}
                className="w-full"
                disabled={!customRegex.trim() || !testString.trim()}
                data-testid="button-analyze-performance"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Performance
              </Button>

              {performanceResults && (
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {performanceResults.avgExecutionTime.toFixed(4)}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg. Execution Time</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {performanceResults.complexityScore.toFixed(1)}/10
                        </div>
                        <div className="text-sm text-gray-600">Complexity Score</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <CheckCircle className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {((performanceResults.matchCount / performanceResults.iterations) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Match Rate</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total execution time:</span>
                          <span className="font-mono">{performanceResults.totalTime.toFixed(2)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Iterations:</span>
                          <span className="font-mono">{performanceResults.iterations.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Test string length:</span>
                          <span className="font-mono">{performanceResults.testStringLength} chars</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pattern length:</span>
                          <span className="font-mono">{performanceResults.pattern.length} chars</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flags:</span>
                          <span className="font-mono">{performanceResults.flags || 'none'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Complexity Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                performanceResults.complexityScore <= 3 ? 'bg-green-500' :
                                performanceResults.complexityScore <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(performanceResults.complexityScore * 10, 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium">
                            {performanceResults.complexityScore <= 3 ? 'Low' :
                             performanceResults.complexityScore <= 6 ? 'Medium' : 'High'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {performanceResults.complexityScore <= 3 && "Good performance expected"}
                          {performanceResults.complexityScore > 3 && performanceResults.complexityScore <= 6 && "Moderate complexity, consider optimization"}
                          {performanceResults.complexityScore > 6 && "High complexity, optimization recommended"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Warnings */}
                  {performanceResults.warnings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Performance Warnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {performanceResults.warnings.map((warning: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-orange-800">{warning}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Optimization Suggestions */}
                  {performanceResults.suggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Lightbulb className="h-5 w-5 text-blue-500" />
                          Optimization Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {performanceResults.suggestions.map((suggestion: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-800">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Benchmark History */}
                  {benchmarkData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Benchmark History</CardTitle>
                        <CardDescription>
                          Compare performance across different patterns
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {benchmarkData.map((benchmark, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <div className="flex-1">
                                <code className="font-mono text-xs bg-gray-100 px-1 rounded">
                                  {benchmark.pattern.length > 30 ? 
                                    benchmark.pattern.substring(0, 30) + '...' : 
                                    benchmark.pattern
                                  }
                                </code>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span>{benchmark.avgTime.toFixed(3)}ms</span>
                                <span>•</span>
                                <span>C: {benchmark.complexity.toFixed(1)}</span>
                                <span>•</span>
                                <span>{benchmark.timestamp}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Library</CardTitle>
              <CardDescription>
                Choose from common regex patterns or create your own
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Common Patterns</label>
                <Select onValueChange={handlePatternSelect}>
                  <SelectTrigger data-testid="select-pattern">
                    <SelectValue placeholder="Select a common pattern..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regexPatterns.map((pattern) => (
                      <SelectItem key={pattern.name} value={pattern.pattern}>
                        {pattern.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPattern && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <strong>Description:</strong> {regexPatterns.find(p => p.pattern === selectedPattern)?.description}
                  </div>
                  <div className="text-sm mt-1">
                    <strong>Example:</strong> {regexPatterns.find(p => p.pattern === selectedPattern)?.example}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regexPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handlePatternSelect(pattern.pattern)}
                    data-testid={`pattern-${pattern.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <h4 className="font-medium text-sm mb-1">{pattern.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{pattern.description}</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono block">
                      {pattern.pattern}
                    </code>
                    <p className="text-xs text-gray-500 mt-1">Example: {pattern.example}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Regex Quick Reference</CardTitle>
          <CardDescription>
            Common regex symbols and their meanings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Character Classes</h4>
              <div className="space-y-1 font-mono">
                <div><code className="bg-gray-100 px-1 rounded">.</code> - Any character</div>
                <div><code className="bg-gray-100 px-1 rounded">\d</code> - Any digit (0-9)</div>
                <div><code className="bg-gray-100 px-1 rounded">\w</code> - Word character</div>
                <div><code className="bg-gray-100 px-1 rounded">\s</code> - Whitespace</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Quantifiers</h4>
              <div className="space-y-1 font-mono">
                <div><code className="bg-gray-100 px-1 rounded">*</code> - 0 or more</div>
                <div><code className="bg-gray-100 px-1 rounded">+</code> - 1 or more</div>
                <div><code className="bg-gray-100 px-1 rounded">?</code> - 0 or 1</div>
                <div><code className="bg-gray-100 px-1 rounded">{`{n,m}`}</code> - Between n and m</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Anchors</h4>
              <div className="space-y-1 font-mono">
                <div><code className="bg-gray-100 px-1 rounded">^</code> - Start of string</div>
                <div><code className="bg-gray-100 px-1 rounded">$</code> - End of string</div>
                <div><code className="bg-gray-100 px-1 rounded">\b</code> - Word boundary</div>
                <div><code className="bg-gray-100 px-1 rounded">|</code> - OR operator</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegexGenerator;