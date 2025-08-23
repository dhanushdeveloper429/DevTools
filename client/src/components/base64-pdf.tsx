import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download, Copy, Trash2, FileText, Lock, Unlock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Base64Pdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [base64Output, setBase64Output] = useState("");
  const [base64Input, setBase64Input] = useState("");
  const [isBase64Valid, setIsBase64Valid] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePdfFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const encodePdfToBase64 = async () => {
    if (!pdfFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Remove the data:application/pdf;base64, prefix
        const base64Data = result.split(',')[1];
        setBase64Output(base64Data);
        setIsProcessing(false);
        
        toast({
          title: "Success",
          description: "PDF encoded to Base64 successfully",
        });
      };
      
      reader.onerror = () => {
        setIsProcessing(false);
        toast({
          title: "Encoding Failed",
          description: "Could not read the PDF file",
          variant: "destructive",
        });
      };

      reader.readAsDataURL(pdfFile);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Encoding Failed",
        description: error instanceof Error ? error.message : "Could not encode PDF",
        variant: "destructive",
      });
    }
  };

  const decodeBase64ToPdf = () => {
    if (!base64Input.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter Base64 data to decode",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate Base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      const cleanBase64 = base64Input.replace(/\s/g, '');
      
      if (!base64Regex.test(cleanBase64)) {
        throw new Error("Invalid Base64 format");
      }

      // Check if it looks like PDF data (starts with PDF header when decoded)
      const binaryString = atob(cleanBase64);
      if (!binaryString.startsWith('%PDF')) {
        toast({
          title: "Warning",
          description: "This doesn't appear to be PDF data, but will proceed with conversion",
          variant: "destructive",
        });
      }

      setIsBase64Valid(true);
      
      // Create preview URL
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      toast({
        title: "Valid Base64",
        description: "Base64 data is valid and ready for preview/download",
      });

    } catch (error) {
      setIsBase64Valid(false);
      setPreviewUrl(null);
      toast({
        title: "Invalid Base64",
        description: "The provided Base64 data is not valid",
        variant: "destructive",
      });
    }
  };

  const downloadDecodedPdf = () => {
    if (!base64Input.trim() || isBase64Valid === false) {
      toast({
        title: "Invalid Data",
        description: "Please provide valid Base64 data first",
        variant: "destructive",
      });
      return;
    }

    try {
      const cleanBase64 = base64Input.replace(/\s/g, '');
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded",
        description: "PDF file has been downloaded successfully",
      });

    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not decode Base64 to PDF",
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

  const downloadBase64Text = () => {
    if (!base64Output) {
      toast({
        title: "No Data",
        description: "Please encode a PDF first",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([base64Output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdfFile?.name?.replace('.pdf', '') || 'encoded'}_base64.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveBase64Json = () => {
    if (!base64Output) {
      toast({
        title: "No Data",
        description: "Please encode a PDF first",
        variant: "destructive",
      });
      return;
    }

    const jsonData = {
      filename: pdfFile?.name || 'document.pdf',
      filesize: pdfFile?.size || 0,
      mimeType: 'application/pdf',
      base64Data: base64Output,
      encodedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdfFile?.name?.replace('.pdf', '') || 'encoded'}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removePdf = () => {
    setPdfFile(null);
    setBase64Output("");
  };

  const clearBase64Input = () => {
    setBase64Input("");
    setIsBase64Valid(null);
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatBase64Length = (length: number) => {
    return new Intl.NumberFormat('en-US').format(length);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Base64 PDF Encoder/Decoder</h2>
        <p className="text-gray-600">Convert PDF files to Base64 encoding and decode Base64 back to PDF files.</p>
      </div>

      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode" className="flex items-center space-x-2" data-testid="tab-encode-pdf">
            <Lock className="h-4 w-4" />
            <span>Encode PDF</span>
          </TabsTrigger>
          <TabsTrigger value="decode" className="flex items-center space-x-2" data-testid="tab-decode-base64">
            <Unlock className="h-4 w-4" />
            <span>Decode Base64</span>
          </TabsTrigger>
        </TabsList>

        {/* PDF to Base64 Encoder */}
        <TabsContent value="encode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">PDF File Input</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('pdf-base64-upload')?.click()}
                data-testid="dropzone-pdf-base64"
              >
                <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">Drop PDF file here</p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <Button variant="outline" className="bg-primary hover:bg-primary-dark text-white">
                  Choose PDF File
                </Button>
                <p className="text-xs text-gray-500 mt-3">Max file size: 50MB</p>
              </div>

              <input
                id="pdf-base64-upload"
                type="file"
                accept=".pdf"
                onChange={handlePdfFileSelect}
                className="hidden"
                data-testid="input-pdf-base64-file"
              />

              {/* File Info */}
              {pdfFile && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900" data-testid="text-pdf-base64-filename">
                            {pdfFile.name}
                          </p>
                          <p className="text-sm text-gray-500" data-testid="text-pdf-base64-filesize">
                            {formatBytes(pdfFile.size)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={removePdf}
                        className="text-gray-400 hover:text-gray-600"
                        data-testid="button-remove-pdf"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                onClick={encodePdfToBase64}
                disabled={!pdfFile || isProcessing}
                className="w-full bg-primary hover:bg-primary-dark"
                data-testid="button-encode-pdf-to-base64"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isProcessing ? "Encoding..." : "Encode to Base64"}
              </Button>
            </div>

            {/* Base64 Output */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Base64 Output</Label>
                <div className="flex items-center space-x-2">
                  {base64Output && (
                    <span className="text-xs text-gray-500" data-testid="text-base64-size">
                      Length: {formatBase64Length(base64Output.length)} chars
                    </span>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(base64Output)}
                    disabled={!base64Output}
                    data-testid="button-copy-base64"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={base64Output}
                readOnly
                placeholder="Base64 encoded PDF will appear here..."
                className="h-80 font-mono text-xs bg-gray-50 resize-none"
                data-testid="textarea-base64-output"
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={downloadBase64Text}
                  disabled={!base64Output}
                  variant="outline"
                  className="flex-1 border-success text-success hover:bg-success hover:text-white"
                  data-testid="button-download-base64-text"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download as Text
                </Button>
                <Button 
                  onClick={saveBase64Json}
                  disabled={!base64Output}
                  variant="outline"
                  className="flex-1 border-warning text-warning hover:bg-warning hover:text-white"
                  data-testid="button-save-base64-json"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save as JSON
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Base64 to PDF Decoder */}
        <TabsContent value="decode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Base64 Input */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Base64 Input</Label>
              <Textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="Paste Base64 encoded PDF data here..."
                className="h-80 font-mono text-xs resize-none"
                data-testid="textarea-base64-input"
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={decodeBase64ToPdf}
                  disabled={!base64Input.trim()}
                  className="flex-1 bg-primary hover:bg-primary-dark"
                  data-testid="button-decode-base64-to-pdf"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Validate & Prepare
                </Button>
                <Button 
                  onClick={clearBase64Input}
                  variant="outline"
                  className="px-4 border-gray-300 hover:bg-gray-50"
                  data-testid="button-clear-base64-input"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              {/* Validation Status */}
              {isBase64Valid === true && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center text-success">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Valid Base64 PDF detected</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {isBase64Valid === false && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-3">
                    <div className="flex items-center text-error">
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Invalid Base64 data</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* PDF Preview/Download */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">PDF Preview & Download</Label>
                {previewUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    data-testid="button-toggle-preview"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>
                )}
              </div>
              
              <div className="border border-gray-300 rounded-lg bg-gray-50 h-80 overflow-hidden">
                {showPreview && previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                    data-testid="iframe-pdf-preview"
                  />
                ) : (
                  <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    {previewUrl ? (
                      <>
                        <p className="text-gray-500 mb-4">PDF ready for preview</p>
                        <p className="text-sm text-gray-400 mb-6">Click "Show Preview" above to view the PDF</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 mb-4">No PDF to preview</p>
                        <p className="text-sm text-gray-400 mb-6">Validate Base64 data first to enable preview</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={downloadDecodedPdf}
                  disabled={!base64Input.trim() || isBase64Valid === false}
                  className="flex-1 bg-primary hover:bg-primary-dark"
                  data-testid="button-download-decoded-pdf"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {previewUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(previewUrl, '_blank')}
                    data-testid="button-open-in-new-tab"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* PDF Info */}
          {isBase64Valid === true && base64Input && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Base64 Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data Size:</span>
                    <span className="font-medium" data-testid="text-decoded-pdf-size">
                      {formatBytes(Math.floor(base64Input.length * 0.75))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Characters:</span>
                    <span className="font-medium" data-testid="text-base64-length">
                      {formatBase64Length(base64Input.length)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Format:</span>
                    <span className="font-medium">PDF Document</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
