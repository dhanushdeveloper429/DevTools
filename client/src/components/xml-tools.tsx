import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Trash2, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, AlignLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatXML, convertXMLToJSON, convertJSONToXML } from "@/lib/formatters";

export default function XmlTools() {
  const [xmlInput, setXmlInput] = useState(`<users><user id="1"><name>John Doe</name><email>john@example.com</email><age>30</age></user><user id="2"><name>Jane Smith</name><email>jane@example.com</email><age>25</age></user></users>`);
  const [xmlOutput, setXmlOutput] = useState("");
  const [xmlToJsonInput, setXmlToJsonInput] = useState(`<users>
  <user id="1">
    <name>John Doe</name>
    <email>john@example.com</email>
  </user>
</users>`);
  const [jsonFromXmlOutput, setJsonFromXmlOutput] = useState("");
  const [isXmlValid, setIsXmlValid] = useState<boolean | null>(null);
  
  const { toast } = useToast();

  const validateXmlMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/validate/xml", { content });
      return response.json();
    },
    onSuccess: (data) => {
      setIsXmlValid(data.valid);
      if (data.valid) {
        setXmlOutput(data.formatted);
      } else {
        setXmlOutput(`Error: ${data.error}`);
      }
    },
    onError: (error) => {
      setIsXmlValid(false);
      setXmlOutput(`Error: ${error.message}`);
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to Copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFormatXML = () => {
    if (!xmlInput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some XML to format",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const formatted = formatXML(xmlInput);
      setXmlOutput(formatted);
      setIsXmlValid(true);
      toast({
        title: "Success",
        description: "XML formatted successfully",
      });
    } catch (error) {
      setXmlOutput(`Error: ${error instanceof Error ? error.message : "Invalid XML"}`);
      setIsXmlValid(false);
      toast({
        title: "Invalid XML",
        description: "Cannot format invalid XML",
        variant: "destructive",
      });
    }
  };

  const handleValidateXML = () => {
    if (!xmlInput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some XML to validate",
        variant: "destructive",
      });
      return;
    }
    validateXmlMutation.mutate(xmlInput);
  };

  const handleMinifyXML = () => {
    try {
      const minified = xmlInput.replace(/>\s+</g, '><').trim();
      setXmlOutput(minified);
      setIsXmlValid(true);
      toast({
        title: "Success",
        description: "XML minified successfully",
      });
    } catch (error) {
      setXmlOutput(`Error: ${error instanceof Error ? error.message : "Invalid XML"}`);
      setIsXmlValid(false);
      toast({
        title: "Invalid XML",
        description: "Cannot minify invalid XML",
        variant: "destructive",
      });
    }
  };

  const handleConvertXMLToJSON = () => {
    if (!xmlToJsonInput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some XML to convert",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const json = convertXMLToJSON(xmlToJsonInput);
      setJsonFromXmlOutput(JSON.stringify(json, null, 2));
      toast({
        title: "Success",
        description: "XML converted to JSON successfully",
      });
    } catch (error) {
      setJsonFromXmlOutput(`Error: ${error instanceof Error ? error.message : "Invalid XML"}`);
      toast({
        title: "Conversion Failed",
        description: "Could not convert XML to JSON",
        variant: "destructive",
      });
    }
  };

  const handleConvertJSONToXML = () => {
    if (!jsonFromXmlOutput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please convert XML to JSON first or enter valid JSON",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const parsed = JSON.parse(jsonFromXmlOutput);
      const xml = convertJSONToXML(parsed);
      setXmlToJsonInput(xml);
      toast({
        title: "Success",
        description: "JSON converted to XML successfully",
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Could not convert JSON to XML",
        variant: "destructive",
      });
    }
  };

  const clearXML = () => {
    setXmlInput("");
    setXmlOutput("");
    setIsXmlValid(null);
  };

  const pasteXML = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setXmlInput(text);
      toast({
        title: "Pasted!",
        description: "Content pasted from clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to Paste",
        description: "Could not paste from clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">XML Tools</h2>

      <Tabs defaultValue="formatter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formatter" className="flex items-center space-x-2" data-testid="tab-xml-formatter">
            <AlignLeft className="h-4 w-4" />
            <span>XML Formatter</span>
          </TabsTrigger>
          <TabsTrigger value="converter" className="flex items-center space-x-2" data-testid="tab-xml-converter">
            <ArrowRight className="h-4 w-4" />
            <span>XML ↔ JSON</span>
          </TabsTrigger>
        </TabsList>

        {/* XML Formatter */}
        <TabsContent value="formatter" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Input XML</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearXML}
                    data-testid="button-clear-xml"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={pasteXML}
                    data-testid="button-paste-xml"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Paste
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={xmlInput}
                onChange={(e) => setXmlInput(e.target.value)}
                placeholder="Paste your XML here..."
                className="h-80 font-mono text-sm resize-none"
                data-testid="textarea-xml-input"
              />

              <div className="flex space-x-2">
                <Button 
                  onClick={handleFormatXML}
                  disabled={validateXmlMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary-dark"
                  data-testid="button-format-xml"
                >
                  <AlignLeft className="h-4 w-4 mr-2" />
                  Format
                </Button>
                <Button 
                  onClick={handleValidateXML}
                  disabled={validateXmlMutation.isPending}
                  variant="outline"
                  className="flex-1 border-success text-success hover:bg-success hover:text-white"
                  data-testid="button-validate-xml"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate
                </Button>
                <Button 
                  onClick={handleMinifyXML}
                  disabled={validateXmlMutation.isPending}
                  variant="outline"
                  className="flex-1 border-warning text-warning hover:bg-warning hover:text-white"
                  data-testid="button-minify-xml"
                >
                  <i className="fas fa-compress mr-2"></i>
                  Minify
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Formatted XML</Label>
                <div className="flex items-center space-x-2">
                  {isXmlValid !== null && (
                    <div className={`flex items-center text-sm ${isXmlValid ? 'text-success' : 'text-error'}`}>
                      {isXmlValid ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-1" />
                      )}
                      <span>{isXmlValid ? "Valid XML" : "Invalid XML"}</span>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(xmlOutput)}
                    disabled={!xmlOutput}
                    data-testid="button-copy-xml"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <pre className="w-full h-80 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
                <code data-testid="text-xml-output">{xmlOutput || "Formatted XML will appear here..."}</code>
              </pre>
            </div>
          </div>
        </TabsContent>

        {/* XML to JSON Converter */}
        <TabsContent value="converter" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">XML Input</Label>
              <Textarea
                value={xmlToJsonInput}
                onChange={(e) => setXmlToJsonInput(e.target.value)}
                placeholder="Paste XML to convert to JSON..."
                className="h-80 font-mono text-sm resize-none"
                data-testid="textarea-xml-to-json-input"
              />
              <Button 
                onClick={handleConvertXMLToJSON}
                className="w-full bg-primary hover:bg-primary-dark"
                data-testid="button-convert-xml-to-json"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Convert XML to JSON
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">JSON Output</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(jsonFromXmlOutput)}
                  disabled={!jsonFromXmlOutput}
                  data-testid="button-copy-converted-json"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="w-full h-80 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
                <code data-testid="text-json-from-xml-output">{jsonFromXmlOutput || "JSON output will appear here..."}</code>
              </pre>
              <Button 
                onClick={handleConvertJSONToXML}
                variant="outline"
                className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white"
                data-testid="button-convert-json-to-xml"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Convert JSON to XML
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
