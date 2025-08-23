import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Code, FileJson, Download, Shuffle, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JsonGenerator = () => {
  const [pojoInput, setPojoInput] = useState(`class User {
  private String firstName;
  private String lastName;
  private int age;
  private String email;
  private boolean isActive;
  private String[] hobbies;
  private Address address;
  
  // getters and setters
}

class Address {
  private String street;
  private String city;
  private String zipCode;
  private String country;
}`);
  const [generatedJson, setGeneratedJson] = useState("");
  const [generatedXml, setGeneratedXml] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [sampleType, setSampleType] = useState("single");
  const [outputFormat, setOutputFormat] = useState("json");
  const { toast } = useToast();

  const languages = [
    { value: "java", label: "Java POJO" },
    { value: "csharp", label: "C# Class" },
    { value: "typescript", label: "TypeScript Interface" },
    { value: "python", label: "Python Class" },
  ];

  const sampleTypes = [
    { value: "single", label: "Single Object" },
    { value: "array", label: "Array of Objects" },
    { value: "minimal", label: "Minimal Data" },
    { value: "realistic", label: "Realistic Data" },
  ];

  const outputFormats = [
    { value: "json", label: "JSON", icon: FileJson },
    { value: "xml", label: "XML", icon: FileCode },
  ];

  const convertToXml = (data: any, rootName: string = "root"): string => {
    const convertValue = (value: any, key: string, indent: number = 0): string => {
      const spaces = "  ".repeat(indent);
      
      if (Array.isArray(value)) {
        return value.map((item) => 
          convertValue(item, key.slice(0, -1), indent)
        ).join("\n");
      }
      
      if (typeof value === "object" && value !== null) {
        const inner = Object.entries(value)
          .map(([k, v]) => convertValue(v, k, indent + 1))
          .join("\n");
        return `${spaces}<${key}>\n${inner}\n${spaces}</${key}>`;
      }
      
      return `${spaces}<${key}>${value}</${key}>`;
    };

    if (Array.isArray(data)) {
      const items = data.map((item) => 
        convertValue(item, "item", 1)
      ).join("\n");
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${items}\n</${rootName}>`;
    } else {
      const content = Object.entries(data)
        .map(([key, value]) => convertValue(value, key, 1))
        .join("\n");
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${content}\n</${rootName}>`;
    }
  };

  const generateSampleData = () => {
    if (!pojoInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class definition",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = parsePojoAndGenerateData(pojoInput, selectedLanguage, sampleType);
      
      if (outputFormat === "json") {
        setGeneratedJson(JSON.stringify(data, null, 2));
        setGeneratedXml("");
        toast({
          title: "Success",
          description: "Sample JSON generated successfully",
        });
      } else {
        setGeneratedXml(convertToXml(data));
        setGeneratedJson("");
        toast({
          title: "Success",
          description: "Sample XML generated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse class definition. Please check the syntax.",
        variant: "destructive",
      });
    }
  };

  const parsePojoAndGenerateData = (input: string, language: string, type: string) => {
    const classes = extractClasses(input, language);
    const mainClass = classes[0];
    
    if (!mainClass) {
      throw new Error("No class found");
    }

    const sampleDataObject = generateSampleObjectData(mainClass, classes, type);
    
    if (type === "array") {
      return [sampleDataObject, generateSampleObjectData(mainClass, classes, type), generateSampleObjectData(mainClass, classes, type)];
    }
    
    return sampleDataObject;
  };

  const extractClasses = (input: string, language: string) => {
    const classes: any[] = [];
    let classMatches: RegExpMatchArray | null = null;

    switch (language) {
      case "java":
        classMatches = input.match(/class\s+(\w+)\s*{([^}]*)}/g);
        break;
      case "csharp":
        classMatches = input.match(/class\s+(\w+)\s*{([^}]*)}/g);
        break;
      case "typescript":
        classMatches = input.match(/interface\s+(\w+)\s*{([^}]*)}/g);
        break;
      case "python":
        classMatches = input.match(/class\s+(\w+).*?:\s*([\s\S]*?)(?=\nclass|\n\n|$)/g);
        break;
    }

    if (classMatches) {
      classMatches.forEach(classMatch => {
        const className = classMatch.match(/(?:class|interface)\s+(\w+)/)?.[1];
        const fields = extractFields(classMatch, language);
        
        if (className) {
          classes.push({ name: className, fields });
        }
      });
    }

    return classes;
  };

  const extractFields = (classContent: string, language: string) => {
    const fields: any[] = [];
    let fieldMatches: RegExpMatchArray | null = null;

    switch (language) {
      case "java":
        fieldMatches = classContent.match(/private\s+(\w+(?:\[\])?)\s+(\w+);/g);
        break;
      case "csharp":
        fieldMatches = classContent.match(/public\s+(\w+(?:\[\])?)\s+(\w+)\s*{[^}]*}/g);
        break;
      case "typescript":
        fieldMatches = classContent.match(/(\w+):\s*(\w+(?:\[\])?);?/g);
        break;
      case "python":
        fieldMatches = classContent.match(/self\.(\w+)\s*:\s*(\w+)/g);
        break;
    }

    if (fieldMatches) {
      fieldMatches.forEach(fieldMatch => {
        const parts = fieldMatch.match(/(\w+)/g);
        if (parts && parts.length >= 2) {
          const type = parts[parts.length - 2];
          const name = parts[parts.length - 1];
          fields.push({ name, type });
        }
      });
    }

    return fields;
  };

  const generateSampleObjectData = (mainClass: any, allClasses: any[], type: string) => {
    const result: any = {};

    mainClass.fields.forEach((field: any) => {
      result[field.name] = generateFieldValue(field, allClasses, type);
    });

    return result;
  };

  const generateFieldValue = (field: any, allClasses: any[], type: string) => {
    const { name, type: fieldType } = field;
    const isArray = fieldType.includes('[]');
    const baseType = fieldType.replace('[]', '');

    let value: any;

    // Check if it's a custom class
    const customClass = allClasses.find(cls => cls.name === baseType);
    if (customClass) {
      value = generateSampleObjectData(customClass, allClasses, type);
    } else {
      value = generatePrimitiveValue(baseType, name, type);
    }

    if (isArray) {
      const arraySize = type === "minimal" ? 1 : 2;
      return Array(arraySize).fill(null).map(() => 
        typeof value === 'object' ? { ...value } : value
      );
    }

    return value;
  };

  const generatePrimitiveValue = (fieldType: string, fieldName: string, sampleType: string) => {
    const lowerFieldName = fieldName.toLowerCase();
    const isRealistic = sampleType === "realistic";

    switch (fieldType.toLowerCase()) {
      case "string":
        if (lowerFieldName.includes("email")) {
          return isRealistic ? "john.doe@example.com" : "user@example.com";
        }
        if (lowerFieldName.includes("name")) {
          return isRealistic ? (lowerFieldName.includes("first") ? "John" : "Doe") : "Sample Name";
        }
        if (lowerFieldName.includes("city")) {
          return isRealistic ? "New York" : "Sample City";
        }
        if (lowerFieldName.includes("street")) {
          return isRealistic ? "123 Main Street" : "Sample Street";
        }
        if (lowerFieldName.includes("country")) {
          return isRealistic ? "USA" : "Sample Country";
        }
        if (lowerFieldName.includes("zip")) {
          return isRealistic ? "10001" : "12345";
        }
        return isRealistic ? "Sample Text" : "string";
      
      case "int":
      case "integer":
        if (lowerFieldName.includes("age")) {
          return isRealistic ? Math.floor(Math.random() * 50) + 20 : 25;
        }
        return isRealistic ? Math.floor(Math.random() * 100) : 0;
      
      case "boolean":
        return isRealistic ? Math.random() > 0.5 : true;
      
      case "double":
      case "float":
        return isRealistic ? Math.round(Math.random() * 1000 * 100) / 100 : 0.0;
      
      case "long":
        return isRealistic ? Math.floor(Math.random() * 1000000) : 0;
      
      case "date":
        return isRealistic ? new Date().toISOString().split('T')[0] : "2024-01-01";
      
      default:
        return `sample_${fieldType}`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${outputFormat.toUpperCase()} copied to clipboard`,
    });
  };

  const downloadData = () => {
    const content = outputFormat === "json" ? generatedJson : generatedXml;
    const fileName = outputFormat === "json" ? "sample-data.json" : "sample-data.xml";
    const mimeType = outputFormat === "json" ? "application/json" : "application/xml";
    
    if (!content) {
      toast({
        title: "Error",
        description: `No ${outputFormat.toUpperCase()} to download`,
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSamplePojo = () => {
    const samples = {
      java: `class Employee {
  private String firstName;
  private String lastName;
  private int employeeId;
  private String department;
  private double salary;
  private boolean isActive;
  private String[] skills;
  private Contact contact;
}

class Contact {
  private String email;
  private String phone;
  private Address address;
}

class Address {
  private String street;
  private String city;
  private String state;
  private String zipCode;
}`,
      csharp: `class Product {
  public string Name { get; set; }
  public string Description { get; set; }
  public double Price { get; set; }
  public int StockQuantity { get; set; }
  public bool IsAvailable { get; set; }
  public string[] Categories { get; set; }
  public Supplier Supplier { get; set; }
}

class Supplier {
  public string CompanyName { get; set; }
  public string ContactEmail { get; set; }
  public string Phone { get; set; }
}`,
      typescript: `interface BlogPost {
  title: string;
  content: string;
  publishDate: string;
  isPublished: boolean;
  viewCount: int;
  tags: string[];
  author: Author;
}

interface Author {
  name: string;
  email: string;
  bio: string;
}`,
      python: `class Customer:
    self.customer_id: int
    self.first_name: string
    self.last_name: string
    self.email: string
    self.registration_date: string
    self.is_premium: boolean
    self.orders: Order[]

class Order:
    self.order_id: int
    self.total_amount: double
    self.order_date: string`
    };

    setPojoInput(samples[selectedLanguage as keyof typeof samples] || samples.java);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            JSON & XML Sample Generator
          </CardTitle>
          <CardDescription>
            Generate sample JSON or XML data from POJO, Bean, or Interface definitions
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Class Definition</CardTitle>
            <CardDescription>
              Enter your POJO, Bean, or Interface definition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sample Type</label>
                <Select value={sampleType} onValueChange={setSampleType}>
                  <SelectTrigger data-testid="select-sample-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Output Format</label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger data-testid="select-output-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Class Definition</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSamplePojo}
                  data-testid="button-load-sample"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Load Sample
                </Button>
              </div>
              <Textarea
                placeholder="Enter your class definition..."
                value={pojoInput}
                onChange={(e) => setPojoInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                data-testid="textarea-pojo-input"
              />
            </div>

            <Button 
              onClick={generateSampleData}
              className="w-full"
              data-testid="button-generate-data"
            >
              <Code className="h-4 w-4 mr-2" />
              Generate Sample {outputFormat.toUpperCase()}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated {outputFormat.toUpperCase()}</CardTitle>
            <CardDescription>
              Sample {outputFormat.toUpperCase()} data based on your class definition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Sample {outputFormat.toUpperCase()} Output</label>
                <div className="flex gap-2">
                  {(generatedJson || generatedXml) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(outputFormat === "json" ? generatedJson : generatedXml)}
                        data-testid="button-copy-data"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadData}
                        data-testid="button-download-data"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Textarea
                value={outputFormat === "json" ? generatedJson : generatedXml}
                readOnly
                placeholder={`Generated ${outputFormat.toUpperCase()} will appear here...`}
                className="min-h-[300px] font-mono text-sm bg-gray-50"
                data-testid="textarea-data-output"
              />
            </div>

            {(generatedJson || generatedXml) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Sample Info</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {selectedLanguage.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">
                    {outputFormat.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">
                    {sampleType === "array" ? "Array" : "Object"}
                  </Badge>
                  <Badge variant="secondary">
                    {Math.round((outputFormat === "json" ? generatedJson : generatedXml).length / 1024 * 100) / 100} KB
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Supported Languages</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Java:</strong> POJO classes with private fields</li>
                <li>• <strong>C#:</strong> Classes with properties</li>
                <li>• <strong>TypeScript:</strong> Interface definitions</li>
                <li>• <strong>Python:</strong> Class definitions with type hints</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Output Formats & Types</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>JSON:</strong> Standard JSON format with proper indentation</li>
                <li>• <strong>XML:</strong> Well-formed XML with proper structure</li>
                <li>• <strong>Single Object:</strong> One instance of the class</li>
                <li>• <strong>Array:</strong> Multiple instances in an array</li>
                <li>• <strong>Minimal:</strong> Simple default values</li>
                <li>• <strong>Realistic:</strong> Context-aware sample data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonGenerator;