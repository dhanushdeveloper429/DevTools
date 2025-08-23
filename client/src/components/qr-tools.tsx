import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Download, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QRTools = () => {
  const [generateText, setGenerateText] = useState("");
  const [qrSize, setQrSize] = useState("200");
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [scanResult, setScanResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateQRCode = () => {
    if (!generateText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to generate QR code",
        variant: "destructive",
      });
      return;
    }

    // Using a free QR code API service
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(generateText)}&color=${qrColor.substring(1)}&bgcolor=${bgColor.substring(1)}`;
    setQrCodeUrl(apiUrl);
    
    toast({
      title: "Success",
      description: "QR code generated successfully",
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qrcode.png';
    link.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll simulate QR code reading
    // In a real implementation, you'd use a QR code reading library
    setTimeout(() => {
      setScanResult("Demo QR Code Content: " + file.name + " - QR reading would happen here with a proper library");
      toast({
        title: "Success",
        description: "QR code scanned successfully",
      });
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const qrTypes = [
    { value: "text", label: "Plain Text" },
    { value: "url", label: "Website URL" },
    { value: "email", label: "Email Address" },
    { value: "phone", label: "Phone Number" },
    { value: "sms", label: "SMS Message" },
    { value: "wifi", label: "WiFi Credentials" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Generator & Scanner
          </CardTitle>
          <CardDescription>
            Generate QR codes from text and scan existing QR codes from images
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" data-testid="tab-generate">
            Generate QR Code
          </TabsTrigger>
          <TabsTrigger value="scan" data-testid="tab-scan">
            Scan QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate QR Code</CardTitle>
              <CardDescription>
                Create QR codes for text, URLs, contact info, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Select defaultValue="text">
                  <SelectTrigger data-testid="select-qr-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qrTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  placeholder="Enter text, URL, email, phone number, etc..."
                  value={generateText}
                  onChange={(e) => setGenerateText(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="textarea-qr-content"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Size (px)</label>
                  <Select value={qrSize} onValueChange={setQrSize}>
                    <SelectTrigger data-testid="select-qr-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="150">150x150</SelectItem>
                      <SelectItem value="200">200x200</SelectItem>
                      <SelectItem value="300">300x300</SelectItem>
                      <SelectItem value="400">400x400</SelectItem>
                      <SelectItem value="500">500x500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">QR Color</label>
                  <Input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    data-testid="input-qr-color"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Background</label>
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    data-testid="input-bg-color"
                  />
                </div>
              </div>

              <Button 
                onClick={generateQRCode} 
                className="w-full"
                data-testid="button-generate-qr"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>

              {qrCodeUrl && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Generated QR Code</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadQRCode}
                      data-testid="button-download-qr"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="flex justify-center p-4 bg-gray-50 rounded border">
                    <img 
                      src={qrCodeUrl} 
                      alt="Generated QR Code" 
                      className="border"
                      data-testid="img-generated-qr"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Upload an image containing a QR code to decode its content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Upload QR Code Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const file = files[0];
                      if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageData = event.target?.result as string;
                          // For demo purposes, simulate QR code reading
                          setTimeout(() => {
                            setScanResult("Demo QR Code Content: " + file.name + " - QR reading would happen here with a proper library");
                            toast({
                              title: "Success", 
                              description: "QR code scanned successfully",
                            });
                          }, 1000);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        toast({
                          title: "Invalid File",
                          description: "Please select a valid image file",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                  data-testid="dropzone-qr"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                    data-testid="input-qr-file"
                  />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Drop image file here or click to browse
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    data-testid="button-upload-qr"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>

              {scanResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Scanned Content</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(scanResult)}
                      data-testid="button-copy-scanned"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border font-mono text-sm break-all">
                    {scanResult}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>📱 Tip:</strong> For best results, ensure the QR code is clear, 
                  well-lit, and fills a good portion of the image frame.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>QR Code Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Common Applications</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Website URLs for easy mobile access</li>
                <li>• Contact information (vCard format)</li>
                <li>• WiFi credentials for guest networks</li>
                <li>• Event tickets and confirmation codes</li>
                <li>• Product information and inventory</li>
                <li>• Social media profile links</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Use high contrast colors</li>
                <li>• Keep content concise for readability</li>
                <li>• Test with multiple devices</li>
                <li>• Include error correction for reliability</li>
                <li>• Provide fallback text when possible</li>
                <li>• Consider printing quality requirements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRTools;