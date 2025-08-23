import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Trash2, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function JsonTools() {
  const [input, setInput] = useState(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "hobbies": ["reading", "coding", "hiking"]
}`);
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const validateMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/validate/json", { content });
      return response.json();
    },
    onSuccess: (data) => {
      setIsValid(data.valid);
      if (data.valid) {
        setOutput(data.formatted);
        setStats(data.stats);
      } else {
        setOutput(`Error: ${data.error}`);
        setStats(null);
      }
    },
    onError: (error) => {
      setIsValid(false);
      setOutput(`Error: ${error.message}`);
      setStats(null);
    },
  });

  const handleFormat = () => {
    if (!input.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some JSON to format",
        variant: "destructive",
      });
      return;
    }
    validateMutation.mutate(input);
  };

  const handleValidate = () => {
    if (!input.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some JSON to validate",
        variant: "destructive",
      });
      return;
    }
    validateMutation.mutate(input);
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      toast({
        title: "Success",
        description: "JSON minified successfully",
      });
    } catch (error) {
      setIsValid(false);
      setOutput(`Error: ${error instanceof Error ? error.message : "Invalid JSON"}`);
      toast({
        title: "Invalid JSON",
        description: "Cannot minify invalid JSON",
        variant: "destructive",
      });
    }
  };

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

  const clearInput = () => {
    setInput("");
    setOutput("");
    setIsValid(null);
    setStats(null);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">JSON Formatter & Validator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Input JSON</Label>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearInput}
                data-testid="button-clear-json"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={pasteFromClipboard}
                data-testid="button-paste-json"
              >
                <FileText className="h-3 w-3 mr-1" />
                Paste
              </Button>
            </div>
          </div>
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="h-80 font-mono text-sm resize-none"
            data-testid="textarea-json-input"
          />

          <div className="flex space-x-2">
            <Button 
              onClick={handleFormat}
              disabled={validateMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary-dark"
              data-testid="button-format-json"
            >
              <i className="fas fa-align-left mr-2"></i>
              {validateMutation.isPending ? "Formatting..." : "Format"}
            </Button>
            <Button 
              onClick={handleValidate}
              disabled={validateMutation.isPending}
              variant="outline"
              className="flex-1 border-success text-success hover:bg-success hover:text-white"
              data-testid="button-validate-json"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button 
              onClick={handleMinify}
              disabled={validateMutation.isPending}
              variant="outline"
              className="flex-1 border-warning text-warning hover:bg-warning hover:text-white"
              data-testid="button-minify-json"
            >
              <i className="fas fa-compress mr-2"></i>
              Minify
            </Button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Formatted JSON</Label>
            <div className="flex items-center space-x-2">
              {isValid !== null && (
                <div className={`flex items-center text-sm ${isValid ? 'text-success' : 'text-error'}`}>
                  {isValid ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  <span>{isValid ? "Valid JSON" : "Invalid JSON"}</span>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(output)}
                disabled={!output}
                data-testid="button-copy-json"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <pre className="w-full h-80 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
              <code data-testid="text-json-output">{output || "Formatted JSON will appear here..."}</code>
            </pre>
          </div>

          {/* JSON Stats */}
          {stats && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">JSON Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium ml-1" data-testid="text-json-size">
                    {formatBytes(stats.size)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Lines:</span>
                  <span className="font-medium ml-1" data-testid="text-json-lines">
                    {stats.lines}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Objects:</span>
                  <span className="font-medium ml-1" data-testid="text-json-objects">
                    {stats.objects}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Arrays:</span>
                  <span className="font-medium ml-1" data-testid="text-json-arrays">
                    {stats.arrays}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
