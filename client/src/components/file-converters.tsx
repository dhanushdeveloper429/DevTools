import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, FileImage, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ConversionResult {
  jobId: string;
  text?: string;
  pages?: number;
  info?: any;
  messages?: any[];
  filename: string;
  type: string;
}

export default function FileConverters() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [conversionResults, setConversionResults] = useState<ConversionResult[]>([]);
  const { toast } = useToast();

  const pdfToTextMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/convert/pdf-to-text", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to convert PDF to text");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const result: ConversionResult = {
        jobId: data.jobId,
        text: data.text,
        pages: data.pages,
        info: data.info,
        filename: `${pdfFile?.name?.replace('.pdf', '') || 'converted'}.txt`,
        type: "text",
      };
      setConversionResults(prev => [...prev, result]);
      toast({
        title: "Success",
        description: "PDF converted to text successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const docxToTextMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/convert/docx-to-text", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to convert DOCX to text");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const result: ConversionResult = {
        jobId: data.jobId,
        text: data.text,
        messages: data.messages,
        filename: `${docxFile?.name?.replace('.docx', '') || 'converted'}.txt`,
        type: "text",
      };
      setConversionResults(prev => [...prev, result]);
      toast({
        title: "Success",
        description: "DOCX converted to text successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const handleDocxFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a DOCX file",
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
      setDocxFile(file);
    }
  };

  const convertPdfToText = () => {
    if (!pdfFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }
    pdfToTextMutation.mutate(pdfFile);
  };

  const convertDocxToText = () => {
    if (!docxFile) {
      toast({
        title: "No File Selected",
        description: "Please select a DOCX file first",
        variant: "destructive",
      });
      return;
    }
    docxToTextMutation.mutate(docxFile);
  };

  const downloadResult = (result: ConversionResult) => {
    if (!result.text) return;

    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: `${result.filename} has been downloaded`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">File Converters</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PDF Converter */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">PDF Converter</h3>
                <p className="text-sm text-gray-500">Convert PDF to text or images</p>
              </div>
            </div>

            {/* File Upload Zone */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors mb-4 cursor-pointer"
              onClick={() => document.getElementById('pdf-upload')?.click()}
              data-testid="dropzone-pdf"
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Drop PDF files here or</p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
              <p className="text-xs text-gray-500 mt-2">Max file size: 50MB</p>
            </div>
            
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handlePdfFileSelect}
              className="hidden"
              data-testid="input-pdf-file"
            />

            {pdfFile && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span className="font-medium" data-testid="text-pdf-filename">{pdfFile.name}</span>
                  </div>
                  <span className="text-gray-500" data-testid="text-pdf-filesize">
                    {formatFileSize(pdfFile.size)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Convert to:</label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={convertPdfToText}
                  disabled={!pdfFile || pdfToTextMutation.isPending}
                  data-testid="button-convert-pdf-to-text"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {pdfToTextMutation.isPending ? "Converting..." : "Text"}
                </Button>
                <Button variant="outline" disabled data-testid="button-convert-pdf-to-images">
                  <FileImage className="h-4 w-4 mr-2" />
                  Images
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {pdfToTextMutation.isPending && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Converting...</span>
                  <span>Processing</span>
                </div>
                <Progress value={75} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* DOCX Converter */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">DOCX Converter</h3>
                <p className="text-sm text-gray-500">Convert Word documents to text or PDF</p>
              </div>
            </div>

            {/* File Upload Zone */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors mb-4 cursor-pointer"
              onClick={() => document.getElementById('docx-upload')?.click()}
              data-testid="dropzone-docx"
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Drop DOCX files here or</p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
              <p className="text-xs text-gray-500 mt-2">Max file size: 50MB</p>
            </div>
            
            <input
              id="docx-upload"
              type="file"
              accept=".docx"
              onChange={handleDocxFileSelect}
              className="hidden"
              data-testid="input-docx-file"
            />

            {docxFile && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium" data-testid="text-docx-filename">{docxFile.name}</span>
                  </div>
                  <span className="text-gray-500" data-testid="text-docx-filesize">
                    {formatFileSize(docxFile.size)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Convert to:</label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={convertDocxToText}
                  disabled={!docxFile || docxToTextMutation.isPending}
                  data-testid="button-convert-docx-to-text"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {docxToTextMutation.isPending ? "Converting..." : "Text"}
                </Button>
                <Button variant="outline" disabled data-testid="button-convert-docx-to-pdf">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {docxToTextMutation.isPending && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Converting...</span>
                  <span>Processing</span>
                </div>
                <Progress value={75} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Results */}
      {conversionResults.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Results</h3>
            <div className="space-y-4">
              {conversionResults.map((result, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900" data-testid={`text-result-filename-${index}`}>
                          {result.filename}
                        </p>
                        <p className="text-sm text-gray-500">
                          {result.pages && `${result.pages} pages • `}
                          {result.text ? `${Math.round(result.text.length / 1024)} KB` : 'Processing...'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => downloadResult(result)}
                      disabled={!result.text}
                      size="sm"
                      className="bg-primary hover:bg-primary-dark"
                      data-testid={`button-download-result-${index}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
