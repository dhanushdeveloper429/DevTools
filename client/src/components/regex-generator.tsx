import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, CheckCircle, Play, Wand2, Code, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegexGenerator = () => {
  const [selectedPattern, setSelectedPattern] = useState("");
  const [customRegex, setCustomRegex] = useState("");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [flags, setFlags] = useState("g");
  const { toast } = useToast();

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

  const testRegex = () => {
    try {
      if (!customRegex.trim()) {
        setMatches([]);
        return;
      }

      const regex = new RegExp(customRegex, flags);
      setIsValid(true);
      
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
    }
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Regex Generator & Tester
          </CardTitle>
          <CardDescription>
            Generate regular expressions from common patterns or create custom regex with live testing
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pattern Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Generator</CardTitle>
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

            <Separator />

            <div>
              <label className="text-sm font-medium mb-2 block">Custom Regex Pattern</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your regex pattern..."
                  value={customRegex}
                  onChange={(e) => setCustomRegex(e.target.value)}
                  className={`font-mono ${!isValid ? 'border-red-500' : ''}`}
                  data-testid="input-custom-regex"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(customRegex, "Regex pattern")}
                  disabled={!customRegex}
                  data-testid="button-copy-regex"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {!isValid && (
                <p className="text-sm text-red-500 mt-1">Invalid regex pattern</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Flags</label>
              <Select value={flags} onValueChange={setFlags}>
                <SelectTrigger data-testid="select-flags">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {flagOptions.map((flag) => (
                    <SelectItem key={flag.value} value={flag.value}>
                      <div>
                        <div className="font-medium">{flag.label}</div>
                        <div className="text-xs text-gray-500">{flag.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateFromText}
              variant="outline"
              className="w-full"
              disabled={!testString.trim()}
              data-testid="button-generate-from-text"
            >
              <Code className="h-4 w-4 mr-2" />
              Generate Regex from Test Text
            </Button>
          </CardContent>
        </Card>

        {/* Regex Tester */}
        <Card>
          <CardHeader>
            <CardTitle>Regex Tester</CardTitle>
            <CardDescription>
              Test your regex pattern against sample text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test String</label>
              <Textarea
                placeholder="Enter text to test against your regex..."
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="min-h-[120px] font-mono"
                data-testid="textarea-test-string"
              />
            </div>

            <Button
              onClick={testRegex}
              className="w-full"
              disabled={!customRegex.trim() || !testString.trim()}
              data-testid="button-test-regex"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Regex
            </Button>

            {customRegex && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Pattern</label>
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                    /{customRegex}/{flags}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Matches ({matches.length})
                  </label>
                  {matches.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {matches.map((match, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                        >
                          <span className="font-mono text-sm">{match}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Match {index + 1}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(match, `Match ${index + 1}`)}
                              data-testid={`button-copy-match-${index}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                      {customRegex && testString ? (
                        isValid ? "No matches found" : "Invalid regex pattern"
                      ) : (
                        "Enter a regex pattern and test string to see matches"
                      )}
                    </div>
                  )}
                </div>

                {matches.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Regex pattern is valid and found {matches.length} match{matches.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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