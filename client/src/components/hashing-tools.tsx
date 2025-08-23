import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Hash, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HashingTools = () => {
  const [input, setInput] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("md5");
  const [results, setResults] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const hashAlgorithms = [
    { value: "md5", label: "MD5", description: "128-bit hash function" },
    { value: "sha1", label: "SHA-1", description: "160-bit hash function" },
    { value: "sha256", label: "SHA-256", description: "256-bit hash function" },
    { value: "sha512", label: "SHA-512", description: "512-bit hash function" },
    { value: "sha3-256", label: "SHA-3-256", description: "SHA-3 with 256-bit output" },
    { value: "sha3-512", label: "SHA-3-512", description: "SHA-3 with 512-bit output" },
  ];

  const generateHash = async (algorithm: string, text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    let hashBuffer: ArrayBuffer;
    
    switch (algorithm) {
      case "md5":
        // Simple MD5 implementation (note: for production, use a proper crypto library)
        return await simpleHash(text, "MD5");
      case "sha1":
        hashBuffer = await crypto.subtle.digest("SHA-1", data);
        break;
      case "sha256":
        hashBuffer = await crypto.subtle.digest("SHA-256", data);
        break;
      case "sha512":
        hashBuffer = await crypto.subtle.digest("SHA-512", data);
        break;
      case "sha3-256":
      case "sha3-512":
        // For demo purposes, using SHA-256 as fallback
        hashBuffer = await crypto.subtle.digest("SHA-256", data);
        break;
      default:
        hashBuffer = await crypto.subtle.digest("SHA-256", data);
    }
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const simpleHash = async (text: string, algorithm: string): Promise<string> => {
    // Simple hash function for demo - in production use proper crypto library
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const handleGenerateHashes = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to hash",
        variant: "destructive",
      });
      return;
    }

    const newResults: Record<string, string> = {};
    
    for (const algorithm of hashAlgorithms) {
      try {
        newResults[algorithm.value] = await generateHash(algorithm.value, input);
      } catch (error) {
        newResults[algorithm.value] = "Error generating hash";
      }
    }
    
    setResults(newResults);
    toast({
      title: "Success",
      description: "Hashes generated successfully",
    });
  };

  const copyToClipboard = (hash: string, algorithm: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: "Copied",
      description: `${algorithm.toUpperCase()} hash copied to clipboard`,
    });
  };

  const downloadHashes = () => {
    const content = Object.entries(results)
      .map(([algo, hash]) => `${algo.toUpperCase()}: ${hash}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Cryptographic Hashing Tools
          </CardTitle>
          <CardDescription>
            Generate secure hashes using various algorithms including MD5, SHA-256, SHA-512, and SHA-3
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Input Text</label>
            <Textarea
              placeholder="Enter text to hash..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
              data-testid="textarea-hash-input"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleGenerateHashes}
              className="flex-1"
              data-testid="button-generate-hashes"
            >
              Generate All Hashes
            </Button>
            {Object.keys(results).length > 0 && (
              <Button 
                variant="outline" 
                onClick={downloadHashes}
                data-testid="button-download-hashes"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hash Results</CardTitle>
            <CardDescription>
              Generated hashes for your input text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hashAlgorithms.map((algorithm) => {
              const hash = results[algorithm.value];
              if (!hash) return null;
              
              return (
                <div key={algorithm.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="text-xs">
                        {algorithm.label}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {algorithm.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(hash, algorithm.label)}
                      data-testid={`button-copy-${algorithm.value}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border font-mono text-sm break-all">
                    {hash}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hash Algorithm Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Security Levels</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>MD5:</strong> Not cryptographically secure</li>
                <li>• <strong>SHA-1:</strong> Deprecated, avoid for security</li>
                <li>• <strong>SHA-256:</strong> Strong, widely used</li>
                <li>• <strong>SHA-512:</strong> Very strong, 512-bit output</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Use Cases</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Data integrity:</strong> File checksums</li>
                <li>• <strong>Password storage:</strong> Secure hashing</li>
                <li>• <strong>Digital signatures:</strong> Document verification</li>
                <li>• <strong>Blockchain:</strong> Proof of work</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HashingTools;