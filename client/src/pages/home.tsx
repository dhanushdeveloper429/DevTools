import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import JsonTools from "@/components/json-tools";
import Decoders from "@/components/decoders";
import XmlTools from "@/components/xml-tools";
import FileConverters from "@/components/file-converters";
import DuplicatesIdentifier from "@/components/duplicates-identifier";
import Base64Pdf from "@/components/base64-pdf";
import HashingTools from "@/components/hashing-tools";
import EncryptionTools from "@/components/encryption-tools";
import QRTools from "@/components/qr-tools";
import TextConverters from "@/components/text-converters";
import JsonGenerator from "@/components/json-generator";
import { Settings, HelpCircle, Wrench, Code, Unlock, FileCode, FileText, Search, Key, Hash, Lock, QrCode, Type, FileJson } from "lucide-react";

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: "json-tools",
      title: "JSON Tools",
      description: "Format, validate, and analyze JSON data with statistics",
      icon: Code,
      color: "bg-blue-500",
      component: <JsonTools />
    },
    {
      id: "decoders",
      title: "Multiple Decoders",
      description: "Decode URL, HTML entities, JWT tokens, Base64 and Base32 data",
      icon: Unlock,
      color: "bg-green-500",
      component: <Decoders />
    },
    {
      id: "hashing-tools",
      title: "Hashing Tools",
      description: "Generate secure hashes using MD5, SHA-256, SHA-512, and SHA-3",
      icon: Hash,
      color: "bg-indigo-500",
      component: <HashingTools />
    },
    {
      id: "encryption-tools",
      title: "Encryption Tools",
      description: "Encrypt and decrypt text using various algorithms and ciphers",
      icon: Lock,
      color: "bg-pink-500",
      component: <EncryptionTools />
    },
    {
      id: "qr-tools",
      title: "QR Code Tools",
      description: "Generate QR codes from text and scan existing QR codes",
      icon: QrCode,
      color: "bg-teal-500",
      component: <QRTools />
    },
    {
      id: "text-converters",
      title: "Text Converters", 
      description: "Convert text cases and transform properties files to YAML",
      icon: Type,
      color: "bg-cyan-500",
      component: <TextConverters />
    },
    {
      id: "json-generator",
      title: "JSON Generator",
      description: "Generate sample JSON data from POJO, Bean, or Interface definitions",
      icon: FileJson,
      color: "bg-emerald-500",
      component: <JsonGenerator />
    },
    {
      id: "xml-tools",
      title: "XML Tools",
      description: "Format XML and convert between XML and JSON formats",
      icon: FileCode,
      color: "bg-purple-500",
      component: <XmlTools />
    },
    {
      id: "file-converters",
      title: "File Converters",
      description: "Convert PDF and DOCX files to text format",
      icon: FileText,
      color: "bg-orange-500",
      component: <FileConverters />
    },
    {
      id: "duplicates",
      title: "Duplicate Identifier",
      description: "Find and remove duplicate entries in JSON and XML data",
      icon: Search,
      color: "bg-yellow-500",
      component: <DuplicatesIdentifier />
    },
    {
      id: "base64-pdf",
      title: "Base64 PDF Tools",
      description: "Encode PDF files to Base64 and decode Base64 back to PDF",
      icon: Key,
      color: "bg-red-500",
      component: <Base64Pdf />
    }
  ];

  if (selectedTool) {
    const tool = tools.find(t => t.id === selectedTool);
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTool(null)}
                  className="mr-2"
                  data-testid="button-back-to-tools"
                >
                  ← Back to Tools
                </Button>
                <div className={`${tool?.color} p-2 rounded-lg`}>
                  {tool?.icon && <tool.icon className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{tool?.title}</h1>
                  <p className="text-sm text-gray-500">{tool?.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  data-testid="button-help"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  data-testid="button-settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
            {tool?.component}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Developer Toolkit</h1>
                <p className="text-sm text-gray-500">Converters, Formatters & Validators</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                data-testid="button-help"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <button 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                data-testid="button-settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Tool</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive developer toolkit featuring cryptographic functions, data transformation, 
            file conversion, formatting, encoding/decoding, and validation tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
              onClick={() => setSelectedTool(tool.id)}
              data-testid={`card-${tool.id}`}
            >
              <CardHeader className="text-center pb-4">
                <div className={`${tool.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <tool.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  {tool.description}
                </p>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                  data-testid={`button-open-${tool.id}`}
                >
                  Open Tool
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Each tool includes built-in validation, error handling, and helpful feedback to guide you through the process.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span>✓ Cryptographic security</span>
              <span>✓ Real-time validation</span>
              <span>✓ File processing</span>
              <span>✓ Export capabilities</span>
              <span>✓ Error recovery</span>
              <span>✓ QR code generation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
