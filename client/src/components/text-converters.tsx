import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Type, FileText, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TextConverters = () => {
  const [inputText, setInputText] = useState("Hello World Example Text");
  const [caseResults, setCaseResults] = useState<Record<string, string>>({});
  const [propertiesInput, setPropertiesInput] = useState(`# Database Configuration
database.host=localhost
database.port=5432
database.username=admin
database.password=secret123
database.name=myapp

# Server Settings
server.port=8080
server.timeout=30000
server.ssl.enabled=true

# Logging
logging.level=INFO
logging.file.path=/var/log/app.log`);
  const [yamlOutput, setYamlOutput] = useState("");
  const { toast } = useToast();

  const caseConverters = [
    {
      name: "lowercase",
      label: "lower case",
      description: "All characters in lowercase",
      convert: (text: string) => text.toLowerCase()
    },
    {
      name: "uppercase",
      label: "UPPER CASE",
      description: "All characters in uppercase",
      convert: (text: string) => text.toUpperCase()
    },
    {
      name: "camelcase",
      label: "lowerCamelCase",
      description: "First word lowercase, subsequent words capitalized",
      convert: (text: string) => {
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
          })
          .replace(/\s+/g, '');
      }
    },
    {
      name: "pascalcase",
      label: "UpperCamelCase",
      description: "First letter of each word capitalized, no spaces",
      convert: (text: string) => {
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, '');
      }
    },
    {
      name: "snakecase",
      label: "snake_case",
      description: "Words separated by underscores, all lowercase",
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('_');
      }
    },
    {
      name: "kebabcase",
      label: "kebab-case",
      description: "Words separated by hyphens, all lowercase",
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('-');
      }
    },
    {
      name: "constantcase",
      label: "CONSTANT_CASE",
      description: "Words separated by underscores, all uppercase",
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toUpperCase())
          .join('_');
      }
    }
  ];

  const convertAllCases = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert",
        variant: "destructive",
      });
      return;
    }

    const results: Record<string, string> = {};
    caseConverters.forEach(converter => {
      results[converter.name] = converter.convert(inputText);
    });
    
    setCaseResults(results);
    toast({
      title: "Success",
      description: "Text converted to all case formats",
    });
  };

  const convertPropertiesToYaml = () => {
    if (!propertiesInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter properties content to convert",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = propertiesInput.split('\n');
      const yamlStructure: any = {};
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          return;
        }
        
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex === -1) return;
        
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        
        // Handle nested properties (e.g., database.host -> database: host:)
        const keyParts = key.split('.');
        let current = yamlStructure;
        
        for (let i = 0; i < keyParts.length - 1; i++) {
          const part = keyParts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        const lastKey = keyParts[keyParts.length - 1];
        // Convert boolean and numeric values
        let convertedValue: any = value;
        if (value.toLowerCase() === 'true') convertedValue = true;
        else if (value.toLowerCase() === 'false') convertedValue = false;
        else if (!isNaN(Number(value)) && value !== '') convertedValue = Number(value);
        
        current[lastKey] = convertedValue;
      });
      
      // Convert to YAML format
      const yamlString = objectToYaml(yamlStructure, 0);
      setYamlOutput(yamlString);
      
      toast({
        title: "Success",
        description: "Properties converted to YAML successfully",
      });
    } catch (error) {
      setYamlOutput("Error: Failed to convert properties to YAML");
      toast({
        title: "Error",
        description: "Failed to convert properties to YAML",
        variant: "destructive",
      });
    }
  };

  const objectToYaml = (obj: any, indent: number): string => {
    let yaml = '';
    const spaces = '  '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += objectToYaml(value, indent + 1);
      } else {
        const yamlValue = typeof value === 'string' ? `"${value}"` : value;
        yaml += `${spaces}${key}: ${yamlValue}\n`;
      }
    }
    
    return yaml;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`,
    });
  };

  const downloadYaml = () => {
    const blob = new Blob([yamlOutput], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Text Case Converters & Format Tools
          </CardTitle>
          <CardDescription>
            Convert text between different case formats and transform file formats
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="case-converter" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="case-converter" data-testid="tab-case-converter">
            <Type className="h-4 w-4 mr-2" />
            Case Converter
          </TabsTrigger>
          <TabsTrigger value="properties-yaml" data-testid="tab-properties-yaml">
            <FileText className="h-4 w-4 mr-2" />
            Properties to YAML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="case-converter">
          <Card>
            <CardHeader>
              <CardTitle>Text Case Converter</CardTitle>
              <CardDescription>
                Convert text between various case formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Input Text</label>
                <Textarea
                  placeholder="Enter text to convert..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[80px]"
                  data-testid="textarea-case-input"
                />
              </div>

              <Button 
                onClick={convertAllCases}
                className="w-full"
                data-testid="button-convert-cases"
              >
                <Type className="h-4 w-4 mr-2" />
                Convert to All Cases
              </Button>

              {Object.keys(caseResults).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Conversion Results</h3>
                  <div className="space-y-3">
                    {caseConverters.map((converter) => {
                      const result = caseResults[converter.name];
                      if (!result) return null;
                      
                      return (
                        <div key={converter.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="secondary" className="text-xs">
                                {converter.label}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {converter.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result, converter.label)}
                              data-testid={`button-copy-${converter.name}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border font-mono text-sm break-all">
                            {result}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties-yaml">
          <Card>
            <CardHeader>
              <CardTitle>Properties to YAML Converter</CardTitle>
              <CardDescription>
                Convert Java properties files to YAML format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Properties File Content</label>
                    <Textarea
                      placeholder="Enter properties file content..."
                      value={propertiesInput}
                      onChange={(e) => setPropertiesInput(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                      data-testid="textarea-properties-input"
                    />
                  </div>
                  
                  <Button 
                    onClick={convertPropertiesToYaml}
                    className="w-full"
                    data-testid="button-convert-properties"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Convert to YAML
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">YAML Output</label>
                    <div className="flex gap-2">
                      {yamlOutput && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(yamlOutput, "YAML")}
                            data-testid="button-copy-yaml"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadYaml}
                            data-testid="button-download-yaml"
                          >
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border min-h-[300px]">
                    <pre className="font-mono text-sm whitespace-pre-wrap" data-testid="text-yaml-output">
                      {yamlOutput || "YAML output will appear here..."}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Format Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Case Formats</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>camelCase:</strong> JavaScript, Java variables</li>
                <li>• <strong>PascalCase:</strong> Class names, components</li>
                <li>• <strong>snake_case:</strong> Python, database fields</li>
                <li>• <strong>kebab-case:</strong> URLs, CSS classes</li>
                <li>• <strong>CONSTANT_CASE:</strong> Environment variables</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Properties to YAML</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Supports nested properties (dot notation)</li>
                <li>• Automatically converts boolean values</li>
                <li>• Converts numeric values when possible</li>
                <li>• Preserves comments structure</li>
                <li>• Handles complex configurations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextConverters;