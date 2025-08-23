import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Copy, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DuplicateGroup {
  value: string;
  field: string;
  items: any[];
}

export default function DuplicatesIdentifier() {
  const [fileType, setFileType] = useState<"json" | "xml">("json");
  const [inputData, setInputData] = useState(`[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  {
    "id": 3,
    "name": "John Doe",
    "email": "john.doe@company.com"
  },
  {
    "id": 4,
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
]`);
  const [criteria, setCriteria] = useState("name");
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const { toast } = useToast();

  const findDuplicates = () => {
    if (!inputData.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some data to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!criteria.trim()) {
      toast({
        title: "No Criteria",
        description: "Please specify duplicate criteria",
        variant: "destructive",
      });
      return;
    }

    try {
      let data;
      
      if (fileType === "json") {
        data = JSON.parse(inputData);
        if (!Array.isArray(data)) {
          data = [data];
        }
      } else {
        // Basic XML parsing - in production, use a proper XML parser
        toast({
          title: "XML Support",
          description: "XML parsing is not fully implemented yet. Please use JSON format.",
          variant: "destructive",
        });
        return;
      }

      const criteriaFields = criteria.split(',').map(field => field.trim());
      const duplicatesMap = new Map<string, any[]>();
      
      // Group items by criteria values
      data.forEach((item: any) => {
        criteriaFields.forEach(field => {
          if (item[field] !== undefined) {
            const key = `${field}:${item[field]}`;
            if (!duplicatesMap.has(key)) {
              duplicatesMap.set(key, []);
            }
            duplicatesMap.get(key)?.push(item);
          }
        });
      });

      // Filter out single items (not duplicates)
      const duplicates: DuplicateGroup[] = [];
      duplicatesMap.forEach((items, key) => {
        if (items.length > 1) {
          const [field, value] = key.split(':');
          duplicates.push({
            field,
            value,
            items,
          });
        }
      });

      setDuplicateGroups(duplicates);
      const totalDuplicateItems = duplicates.reduce((sum, group) => sum + group.items.length, 0);
      setDuplicateCount(totalDuplicateItems);

      toast({
        title: "Analysis Complete",
        description: `Found ${duplicates.length} duplicate groups with ${totalDuplicateItems} total items`,
      });

    } catch (error) {
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Could not parse input data",
        variant: "destructive",
      });
    }
  };

  const exportCleanedData = () => {
    if (!inputData.trim()) return;

    try {
      const data = JSON.parse(inputData);
      const seen = new Set<string>();
      const criteriaFields = criteria.split(',').map(field => field.trim());
      
      const cleaned = data.filter((item: any) => {
        const key = criteriaFields.map(field => `${field}:${item[field]}`).join('|');
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      const cleanedJson = JSON.stringify(cleaned, null, 2);
      downloadAsFile(cleanedJson, 'cleaned-data.json', 'application/json');

      toast({
        title: "Exported",
        description: "Cleaned data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export cleaned data",
        variant: "destructive",
      });
    }
  };

  const exportDuplicatesOnly = () => {
    if (duplicateGroups.length === 0) {
      toast({
        title: "No Duplicates",
        description: "Please find duplicates first",
        variant: "destructive",
      });
      return;
    }

    const duplicatesData = duplicateGroups.map(group => ({
      field: group.field,
      value: group.value,
      duplicateItems: group.items,
    }));

    const duplicatesJson = JSON.stringify(duplicatesData, null, 2);
    downloadAsFile(duplicatesJson, 'duplicates-only.json', 'application/json');

    toast({
      title: "Exported",
      description: "Duplicates data exported successfully",
    });
  };

  const downloadAsFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Duplicate Identifier</h2>
        <p className="text-gray-600">Find duplicate entries in JSON and XML files based on specified criteria.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">File Type</Label>
            <Tabs value={fileType} onValueChange={(value) => setFileType(value as "json" | "xml")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="json" data-testid="tab-json-duplicates">JSON</TabsTrigger>
                <TabsTrigger value="xml" data-testid="tab-xml-duplicates">XML</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">Input Data</Label>
            <Textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Paste your JSON or XML data here..."
              className="h-80 font-mono text-sm resize-none"
              data-testid="textarea-duplicate-input"
            />
          </div>

          <div>
            <Label htmlFor="criteria" className="text-sm font-medium text-gray-700 mb-2">
              Duplicate Criteria
            </Label>
            <Input
              id="criteria"
              type="text"
              placeholder="e.g., name, email, id (comma-separated)"
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              data-testid="input-duplicate-criteria"
            />
          </div>

          <Button 
            onClick={findDuplicates}
            className="w-full bg-primary hover:bg-primary-dark"
            data-testid="button-find-duplicates"
          >
            <Search className="h-4 w-4 mr-2" />
            Find Duplicates
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Duplicate Results</Label>
            <div className="text-sm text-gray-500">
              Found: <span className="font-medium text-warning" data-testid="text-duplicate-count">
                {duplicateGroups.length} duplicate groups
              </span>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg">
            <div className="max-h-80 overflow-y-auto">
              {duplicateGroups.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No duplicates found. Click "Find Duplicates" to analyze your data.</p>
                </div>
              ) : (
                duplicateGroups.map((group, index) => (
                  <div key={index} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-4 bg-yellow-50">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium text-sm">
                          Duplicate Group {index + 1}: "{group.value}" ({group.field})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-white border border-gray-200 rounded p-3">
                            <pre className="font-mono text-xs text-gray-700">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              onClick={exportCleanedData}
              disabled={!inputData.trim()}
              variant="outline"
              className="flex-1 border-success text-success hover:bg-success hover:text-white"
              data-testid="button-export-cleaned"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Cleaned
            </Button>
            <Button 
              onClick={exportDuplicatesOnly}
              disabled={duplicateGroups.length === 0}
              variant="outline"
              className="flex-1 border-warning text-warning hover:bg-warning hover:text-white"
              data-testid="button-export-duplicates"
            >
              <Copy className="h-4 w-4 mr-2" />
              Export Duplicates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
