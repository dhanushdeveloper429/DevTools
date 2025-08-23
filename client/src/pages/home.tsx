import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JsonTools from "@/components/json-tools";
import Decoders from "@/components/decoders";
import XmlTools from "@/components/xml-tools";
import FileConverters from "@/components/file-converters";
import DuplicatesIdentifier from "@/components/duplicates-identifier";
import Base64Pdf from "@/components/base64-pdf";
import { Settings, HelpCircle, Wrench } from "lucide-react";

export default function Home() {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Tabs defaultValue="json-tools" className="w-full">
            <div className="border-b border-gray-200 bg-gray-50">
              <TabsList className="w-full bg-transparent p-0 h-auto border-0 rounded-none overflow-x-auto">
                <div className="flex min-w-max">
                  <TabsTrigger 
                    value="json-tools" 
                    className="flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-white rounded-none"
                    data-testid="tab-json-tools"
                  >
                    <i className="fas fa-code mr-2"></i>
                    JSON Tools
                  </TabsTrigger>
                  <TabsTrigger 
                    value="decoders" 
                    className="flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-white rounded-none"
                    data-testid="tab-decoders"
                  >
                    <i className="fas fa-unlock mr-2"></i>
                    Decoders
                  </TabsTrigger>
                  <TabsTrigger 
                    value="xml-tools" 
                    className="flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-white rounded-none"
                    data-testid="tab-xml-tools"
                  >
                    <i className="fas fa-file-code mr-2"></i>
                    XML Tools
                  </TabsTrigger>
                  <TabsTrigger 
                    value="file-converters" 
                    className="flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-white rounded-none"
                    data-testid="tab-file-converters"
                  >
                    <i className="fas fa-file-export mr-2"></i>
                    File Converters
                  </TabsTrigger>
                  <TabsTrigger 
                    value="duplicates" 
                    className="flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-white rounded-none"
                    data-testid="tab-duplicates"
                  >
                    <i className="fas fa-search-plus mr-2"></i>
                    Duplicates
                  </TabsTrigger>
                  <TabsTrigger 
                    value="base64-pdf" 
                    className="flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-white rounded-none"
                    data-testid="tab-base64-pdf"
                  >
                    <i className="fas fa-file-pdf mr-2"></i>
                    Base64 PDF
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="json-tools" className="mt-0">
                <JsonTools />
              </TabsContent>
              
              <TabsContent value="decoders" className="mt-0">
                <Decoders />
              </TabsContent>
              
              <TabsContent value="xml-tools" className="mt-0">
                <XmlTools />
              </TabsContent>
              
              <TabsContent value="file-converters" className="mt-0">
                <FileConverters />
              </TabsContent>
              
              <TabsContent value="duplicates" className="mt-0">
                <DuplicatesIdentifier />
              </TabsContent>
              
              <TabsContent value="base64-pdf" className="mt-0">
                <Base64Pdf />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
