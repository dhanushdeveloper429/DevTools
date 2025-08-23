import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Unlock, Link, Code, Key, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Decoders() {
  const [urlInput, setUrlInput] = useState("https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26category%3Dall");
  const [urlOutput, setUrlOutput] = useState("");
  const [htmlInput, setHtmlInput] = useState("&lt;div class=&quot;example&quot;&gt;Hello &amp; World&lt;/div&gt;");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [jwtInput, setJwtInput] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  const [jwtHeader, setJwtHeader] = useState("");
  const [jwtPayload, setJwtPayload] = useState("");
  const [jwtSignature, setJwtSignature] = useState("");
  const [base64Input, setBase64Input] = useState("SGVsbG8gV29ybGQhIFRoaXMgaXMgYSBCYXNlNjQgZW5jb2RlZCBtZXNzYWdl");
  const [base64Output, setBase64Output] = useState("");
  
  const { toast } = useToast();

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

  const decodeURL = () => {
    try {
      const decoded = decodeURIComponent(urlInput);
      setUrlOutput(decoded);
      toast({
        title: "Success",
        description: "URL decoded successfully",
      });
    } catch (error) {
      setUrlOutput("Error: Invalid URL encoding");
      toast({
        title: "Error",
        description: "Invalid URL encoding",
        variant: "destructive",
      });
    }
  };

  const encodeURL = () => {
    try {
      const encoded = encodeURIComponent(urlOutput || urlInput);
      setUrlInput(encoded);
      toast({
        title: "Success",
        description: "URL encoded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not encode URL",
        variant: "destructive",
      });
    }
  };

  const decodeHTML = () => {
    try {
      const parser = new DOMParser();
      const decoded = htmlInput
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&');
      setHtmlOutput(decoded);
      toast({
        title: "Success",
        description: "HTML entities decoded successfully",
      });
    } catch (error) {
      setHtmlOutput("Error: Could not decode HTML entities");
      toast({
        title: "Error",
        description: "Could not decode HTML entities",
        variant: "destructive",
      });
    }
  };

  const encodeHTML = () => {
    try {
      const encoded = (htmlOutput || htmlInput)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      setHtmlInput(encoded);
      toast({
        title: "Success",
        description: "HTML entities encoded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not encode HTML entities",
        variant: "destructive",
      });
    }
  };

  const decodeJWT = () => {
    try {
      const parts = jwtInput.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      // Decode header
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      setJwtHeader(JSON.stringify(header, null, 2));

      // Decode payload
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      setJwtPayload(JSON.stringify(payload, null, 2));

      // Set signature (cannot be decoded without secret)
      setJwtSignature(parts[2]);

      toast({
        title: "Success",
        description: "JWT decoded successfully",
      });
    } catch (error) {
      setJwtHeader("Error: Invalid JWT");
      setJwtPayload("Error: Invalid JWT");
      setJwtSignature("Error: Invalid JWT");
      toast({
        title: "Error",
        description: "Invalid JWT format",
        variant: "destructive",
      });
    }
  };

  const decodeBase64 = () => {
    try {
      const decoded = atob(base64Input);
      setBase64Output(decoded);
      toast({
        title: "Success",
        description: "Base64 decoded successfully",
      });
    } catch (error) {
      setBase64Output("Error: Invalid Base64 encoding");
      toast({
        title: "Error",
        description: "Invalid Base64 encoding",
        variant: "destructive",
      });
    }
  };

  const encodeBase64 = () => {
    try {
      const encoded = btoa(base64Output || base64Input);
      setBase64Input(encoded);
      toast({
        title: "Success",
        description: "Base64 encoded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not encode to Base64",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Multiple Decoders</h2>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="url" className="flex items-center space-x-2" data-testid="tab-url-decoder">
            <Link className="h-4 w-4" />
            <span>URL Decoder</span>
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center space-x-2" data-testid="tab-html-decoder">
            <Code className="h-4 w-4" />
            <span>HTML Entities</span>
          </TabsTrigger>
          <TabsTrigger value="jwt" className="flex items-center space-x-2" data-testid="tab-jwt-decoder">
            <Key className="h-4 w-4" />
            <span>JWT Decoder</span>
          </TabsTrigger>
          <TabsTrigger value="base64" className="flex items-center space-x-2" data-testid="tab-base64-decoder">
            <Type className="h-4 w-4" />
            <span>Base64</span>
          </TabsTrigger>
        </TabsList>

        {/* URL Decoder */}
        <TabsContent value="url" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Encoded URL</Label>
              <Textarea
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste encoded URL here..."
                className="h-32 font-mono text-sm"
                data-testid="textarea-url-input"
              />
              <Button 
                onClick={decodeURL}
                className="w-full bg-primary hover:bg-primary-dark"
                data-testid="button-decode-url"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Decode URL
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Decoded URL</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(urlOutput)}
                  disabled={!urlOutput}
                  data-testid="button-copy-decoded-url"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="w-full h-32 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
                <div data-testid="text-url-output">{urlOutput || "Decoded URL will appear here..."}</div>
              </div>
              <Button 
                onClick={encodeURL}
                variant="outline"
                className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white"
                data-testid="button-encode-url"
              >
                <i className="fas fa-lock mr-2"></i>
                Encode URL
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* HTML Entities Decoder */}
        <TabsContent value="html" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">HTML Entities</Label>
              <Textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="Paste HTML entities here..."
                className="h-32 font-mono text-sm"
                data-testid="textarea-html-input"
              />
              <Button 
                onClick={decodeHTML}
                className="w-full bg-primary hover:bg-primary-dark"
                data-testid="button-decode-html"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Decode HTML
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Decoded HTML</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(htmlOutput)}
                  disabled={!htmlOutput}
                  data-testid="button-copy-decoded-html"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="w-full h-32 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
                <div data-testid="text-html-output">{htmlOutput || "Decoded HTML will appear here..."}</div>
              </div>
              <Button 
                onClick={encodeHTML}
                variant="outline"
                className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white"
                data-testid="button-encode-html"
              >
                <i className="fas fa-lock mr-2"></i>
                Encode HTML
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* JWT Decoder */}
        <TabsContent value="jwt" className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">JWT Token</Label>
            <Textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="Paste JWT token here..."
              className="h-24 font-mono text-sm"
              data-testid="textarea-jwt-input"
            />
            <Button 
              onClick={decodeJWT}
              className="mt-2 bg-primary hover:bg-primary-dark"
              data-testid="button-decode-jwt"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Decode JWT
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Header */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Header</Label>
              <pre className="p-4 bg-red-50 border border-red-200 rounded-lg font-mono text-sm h-48 overflow-auto">
                <code data-testid="text-jwt-header">{jwtHeader || "JWT header will appear here..."}</code>
              </pre>
            </div>

            {/* Payload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Payload</Label>
              <pre className="p-4 bg-purple-50 border border-purple-200 rounded-lg font-mono text-sm h-48 overflow-auto">
                <code data-testid="text-jwt-payload">{jwtPayload || "JWT payload will appear here..."}</code>
              </pre>
            </div>

            {/* Signature */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Signature</Label>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg h-48 overflow-auto">
                <p className="font-mono text-sm break-all" data-testid="text-jwt-signature">
                  {jwtSignature || "JWT signature will appear here..."}
                </p>
                <p className="text-xs text-gray-500 mt-2">Signature verification requires secret key</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Base64 Decoder */}
        <TabsContent value="base64" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Base64 Input</Label>
              <Textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="Paste Base64 encoded text here..."
                className="h-32 font-mono text-sm"
                data-testid="textarea-base64-input"
              />
              <Button 
                onClick={decodeBase64}
                className="w-full bg-primary hover:bg-primary-dark"
                data-testid="button-decode-base64"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Decode Base64
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Decoded Text</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(base64Output)}
                  disabled={!base64Output}
                  data-testid="button-copy-decoded-base64"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="w-full h-32 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
                <div data-testid="text-base64-output">{base64Output || "Decoded text will appear here..."}</div>
              </div>
              <Button 
                onClick={encodeBase64}
                variant="outline"
                className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white"
                data-testid="button-encode-base64"
              >
                <i className="fas fa-lock mr-2"></i>
                Encode Base64
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
