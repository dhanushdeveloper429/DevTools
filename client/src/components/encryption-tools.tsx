import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EncryptionTools = () => {
  const [encryptInput, setEncryptInput] = useState("");
  const [decryptInput, setDecryptInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [algorithm, setAlgorithm] = useState("aes");
  const [encryptResult, setEncryptResult] = useState("");
  const [decryptResult, setDecryptResult] = useState("");
  const { toast } = useToast();

  // Simple encryption functions (for demo purposes)
  const simpleEncrypt = (text: string, key: string): string => {
    if (!text || !key) return "";
    
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode
  };

  const simpleDecrypt = (encryptedText: string, key: string): string => {
    if (!encryptedText || !key) return "";
    
    try {
      const decoded = atob(encryptedText); // Base64 decode
      let result = "";
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (error) {
      return "Invalid encrypted text or key";
    }
  };

  const caesarCipher = (text: string, shift: number): string => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - start + shift) % 26) + start);
    });
  };

  const rot13 = (text: string): string => {
    return caesarCipher(text, 13);
  };

  const handleEncrypt = () => {
    if (!encryptInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to encrypt",
        variant: "destructive",
      });
      return;
    }

    let result = "";
    
    switch (algorithm) {
      case "aes":
        if (!password) {
          toast({
            title: "Error",
            description: "Password is required for AES encryption",
            variant: "destructive",
          });
          return;
        }
        result = simpleEncrypt(encryptInput, password);
        break;
      case "caesar":
        const shift = password ? parseInt(password) || 3 : 3;
        result = caesarCipher(encryptInput, shift);
        break;
      case "rot13":
        result = rot13(encryptInput);
        break;
      case "base64":
        result = btoa(encryptInput);
        break;
      default:
        result = simpleEncrypt(encryptInput, password || "defaultkey");
    }
    
    setEncryptResult(result);
    toast({
      title: "Success",
      description: "Text encrypted successfully",
    });
  };

  const handleDecrypt = () => {
    if (!decryptInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to decrypt",
        variant: "destructive",
      });
      return;
    }

    let result = "";
    
    try {
      switch (algorithm) {
        case "aes":
          if (!password) {
            toast({
              title: "Error",
              description: "Password is required for AES decryption",
              variant: "destructive",
            });
            return;
          }
          result = simpleDecrypt(decryptInput, password);
          break;
        case "caesar":
          const shift = password ? parseInt(password) || 3 : 3;
          result = caesarCipher(decryptInput, -shift);
          break;
        case "rot13":
          result = rot13(decryptInput); // ROT13 is its own inverse
          break;
        case "base64":
          result = atob(decryptInput);
          break;
        default:
          result = simpleDecrypt(decryptInput, password || "defaultkey");
      }
      
      setDecryptResult(result);
      toast({
        title: "Success",
        description: "Text decrypted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decrypt text. Check your input and key.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`,
    });
  };

  const algorithms = [
    { value: "aes", label: "AES (Simulated)", description: "Advanced Encryption Standard" },
    { value: "caesar", label: "Caesar Cipher", description: "Simple substitution cipher" },
    { value: "rot13", label: "ROT13", description: "Caesar cipher with shift of 13" },
    { value: "base64", label: "Base64", description: "Base64 encoding/decoding" },
  ];

  const selectedAlgorithmInfo = algorithms.find(a => a.value === algorithm);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encryption & Decryption Tools
          </CardTitle>
          <CardDescription>
            Encrypt and decrypt text using various algorithms and methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Algorithm</label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger data-testid="select-algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {algorithms.map((algo) => (
                  <SelectItem key={algo.value} value={algo.value}>
                    {algo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAlgorithmInfo && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedAlgorithmInfo.description}
              </p>
            )}
          </div>

          {(algorithm === "aes" || algorithm === "caesar") && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {algorithm === "caesar" ? "Shift Value" : "Password/Key"}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={algorithm === "caesar" ? "Enter shift value (e.g., 3)" : "Enter encryption password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="encrypt" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encrypt" data-testid="tab-encrypt">
            <Lock className="h-4 w-4 mr-2" />
            Encrypt
          </TabsTrigger>
          <TabsTrigger value="decrypt" data-testid="tab-decrypt">
            <Unlock className="h-4 w-4 mr-2" />
            Decrypt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encrypt">
          <Card>
            <CardHeader>
              <CardTitle>Encrypt Text</CardTitle>
              <CardDescription>
                Enter plain text to encrypt using the selected algorithm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text to encrypt..."
                value={encryptInput}
                onChange={(e) => setEncryptInput(e.target.value)}
                className="min-h-[100px]"
                data-testid="textarea-encrypt-input"
              />
              
              <Button 
                onClick={handleEncrypt} 
                className="w-full"
                data-testid="button-encrypt"
              >
                <Lock className="h-4 w-4 mr-2" />
                Encrypt Text
              </Button>

              {encryptResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Encrypted Result</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(encryptResult, "Encrypted text")}
                      data-testid="button-copy-encrypted"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border font-mono text-sm break-all">
                    {encryptResult}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decrypt">
          <Card>
            <CardHeader>
              <CardTitle>Decrypt Text</CardTitle>
              <CardDescription>
                Enter encrypted text to decrypt using the selected algorithm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter encrypted text to decrypt..."
                value={decryptInput}
                onChange={(e) => setDecryptInput(e.target.value)}
                className="min-h-[100px]"
                data-testid="textarea-decrypt-input"
              />
              
              <Button 
                onClick={handleDecrypt} 
                className="w-full"
                data-testid="button-decrypt"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Decrypt Text
              </Button>

              {decryptResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Decrypted Result</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(decryptResult, "Decrypted text")}
                      data-testid="button-copy-decrypted"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border font-mono text-sm break-all">
                    {decryptResult}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Security Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ For Educational Purposes:</strong> These encryption tools are simplified implementations 
              for demonstration purposes. For production applications requiring strong security, 
              use established cryptographic libraries and follow security best practices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionTools;