import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Copy, Plus, Trash2, RefreshCw, Database, Code, Download, Globe, Server, FileJson, Zap, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiEndpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  responseSchema: any;
  enabled: boolean;
}

interface DataField {
  id: string;
  name: string;
  type: string;
  format?: string;
  length?: number;
  min?: number;
  max?: number;
  options?: string[];
  nullable: boolean;
}

const FakeJsonApi = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    {
      id: "1",
      name: "Get Users",
      method: "GET",
      path: "/api/users",
      description: "Get list of users with pagination",
      responseSchema: [],
      enabled: true
    }
  ]);
  
  const [currentEndpoint, setCurrentEndpoint] = useState<string>("1");
  const [dataFields, setDataFields] = useState<DataField[]>([
    { id: "1", name: "id", type: "number", min: 1, max: 10000, nullable: false },
    { id: "2", name: "firstName", type: "firstName", nullable: false },
    { id: "3", name: "lastName", type: "lastName", nullable: false },
    { id: "4", name: "email", type: "email", nullable: false },
    { id: "5", name: "age", type: "number", min: 18, max: 80, nullable: false },
  ]);
  
  const [recordCount, setRecordCount] = useState(10);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includePagination, setIncludePagination] = useState(true);
  const [generatedJson, setGeneratedJson] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const dataTypes = [
    { value: "string", label: "String", hasLength: true },
    { value: "number", label: "Number", hasRange: true },
    { value: "boolean", label: "Boolean" },
    { value: "date", label: "Date" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "fullName", label: "Full Name" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "address", label: "Address" },
    { value: "city", label: "City" },
    { value: "country", label: "Country" },
    { value: "company", label: "Company" },
    { value: "jobTitle", label: "Job Title" },
    { value: "uuid", label: "UUID" },
    { value: "url", label: "URL" },
    { value: "color", label: "Color" },
    { value: "image", label: "Image URL" },
    { value: "custom", label: "Custom Options", hasOptions: true },
  ];

  const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  const sampleData = {
    firstNames: ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Jessica", "William", "Ashley", "James", "Amanda", "Christopher", "Stephanie", "Daniel", "Melissa"],
    lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"],
    companies: ["TechCorp", "InnovateLabs", "DataDyne", "CloudTech", "NextGen Solutions", "Digital Dynamics", "FutureSoft", "CyberSpace Inc", "TechNova", "ByteWorks"],
    jobTitles: ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "DevOps Engineer", "Marketing Manager", "Sales Representative", "HR Specialist", "Financial Analyst", "Project Manager"],
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
    countries: ["United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "Japan", "Brazil", "India", "Mexico"],
    colors: ["#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#F5FF33", "#33FFF5", "#F533FF", "#FF3333", "#33FF33", "#3333FF"]
  };

  const generateRandomValue = (field: DataField): any => {
    if (field.nullable && Math.random() < 0.1) {
      return null;
    }

    switch (field.type) {
      case "string":
        const length = field.length || 10;
        return Math.random().toString(36).substring(2, 2 + length);
        
      case "number":
        const min = field.min || 0;
        const max = field.max || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
        
      case "boolean":
        return Math.random() < 0.5;
        
      case "date":
        const start = new Date(2020, 0, 1);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0];
        
      case "firstName":
        return getRandomItem(sampleData.firstNames);
        
      case "lastName":
        return getRandomItem(sampleData.lastNames);
        
      case "fullName":
        return `${getRandomItem(sampleData.firstNames)} ${getRandomItem(sampleData.lastNames)}`;
        
      case "email":
        const firstName = getRandomItem(sampleData.firstNames).toLowerCase();
        const lastName = getRandomItem(sampleData.lastNames).toLowerCase();
        const emailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "example.com"];
        return `${firstName}.${lastName}@${getRandomItem(emailDomains)}`;
        
      case "phone":
        return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
        
      case "address":
        return `${Math.floor(Math.random() * 9999) + 1} ${getRandomItem(['Main St', 'Oak Ave', 'First St', 'Park Rd', 'Church St'])}`;
        
      case "city":
        return getRandomItem(sampleData.cities);
        
      case "country":
        return getRandomItem(sampleData.countries);
        
      case "company":
        return getRandomItem(sampleData.companies);
        
      case "jobTitle":
        return getRandomItem(sampleData.jobTitles);
        
      case "uuid":
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        
      case "url":
        const protocols = ["https://"];
        const urlDomains = ["example.com", "test.org", "demo.net", "sample.io"];
        return `${getRandomItem(protocols)}${getRandomItem(urlDomains)}`;
        
      case "color":
        return getRandomItem(sampleData.colors);
        
      case "image":
        const size = 400 + Math.floor(Math.random() * 400);
        return `https://picsum.photos/${size}/${size}`;
        
      case "custom":
        return field.options && field.options.length > 0 ? getRandomItem(field.options) : "custom value";
        
      default:
        return "default value";
    }
  };

  const getRandomItem = (array: any[]) => array[Math.floor(Math.random() * array.length)];

  const addEndpoint = () => {
    const newEndpoint: ApiEndpoint = {
      id: Date.now().toString(),
      name: "New Endpoint",
      method: "GET",
      path: "/api/new",
      description: "New API endpoint",
      responseSchema: [],
      enabled: true
    };
    setEndpoints([...endpoints, newEndpoint]);
    setCurrentEndpoint(newEndpoint.id);
  };

  const updateEndpoint = (id: string, updates: Partial<ApiEndpoint>) => {
    setEndpoints(endpoints.map(ep => ep.id === id ? { ...ep, ...updates } : ep));
  };

  const removeEndpoint = (id: string) => {
    const newEndpoints = endpoints.filter(ep => ep.id !== id);
    setEndpoints(newEndpoints);
    if (currentEndpoint === id && newEndpoints.length > 0) {
      setCurrentEndpoint(newEndpoints[0].id);
    }
  };

  const addDataField = () => {
    const newField: DataField = {
      id: Date.now().toString(),
      name: "newField",
      type: "string",
      nullable: false
    };
    setDataFields([...dataFields, newField]);
  };

  const updateDataField = (id: string, updates: Partial<DataField>) => {
    setDataFields(dataFields.map(field => field.id === id ? { ...field, ...updates } : field));
  };

  const removeDataField = (id: string) => {
    setDataFields(dataFields.filter(field => field.id !== id));
  };

  const generateJsonData = () => {
    setIsGenerating(true);
    
    try {
      const records = [];
      for (let i = 0; i < recordCount; i++) {
        const record: any = {};
        dataFields.forEach(field => {
          record[field.name] = generateRandomValue(field);
        });
        records.push(record);
      }

      let response: any = {
        data: records
      };

      if (includeMetadata) {
        response.metadata = {
          total: recordCount,
          count: recordCount,
          generated_at: new Date().toISOString(),
          endpoint: endpoints.find(ep => ep.id === currentEndpoint)?.path || "/api/data"
        };
      }

      if (includePagination && recordCount > 10) {
        response.pagination = {
          page: 1,
          per_page: recordCount,
          total_pages: 1,
          total_records: recordCount,
          next_page: null,
          prev_page: null
        };
      }

      setGeneratedJson(response);
      
      toast({
        title: "JSON Generated!",
        description: `Successfully generated ${recordCount} records`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate JSON data",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (data: any, label: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportJson = () => {
    if (!generatedJson) {
      toast({
        title: "No Data",
        description: "Please generate JSON data first",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([JSON.stringify(generatedJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fake-api-response.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "JSON data exported successfully",
    });
  };

  const loadTemplate = (template: string) => {
    switch (template) {
      case "users":
        setDataFields([
          { id: "1", name: "id", type: "number", min: 1, max: 10000, nullable: false },
          { id: "2", name: "firstName", type: "firstName", nullable: false },
          { id: "3", name: "lastName", type: "lastName", nullable: false },
          { id: "4", name: "email", type: "email", nullable: false },
          { id: "5", name: "age", type: "number", min: 18, max: 80, nullable: false },
          { id: "6", name: "phone", type: "phone", nullable: true },
          { id: "7", name: "address", type: "address", nullable: true },
        ]);
        break;
      case "products":
        setDataFields([
          { id: "1", name: "id", type: "number", min: 1, max: 1000, nullable: false },
          { id: "2", name: "name", type: "string", length: 20, nullable: false },
          { id: "3", name: "price", type: "number", min: 10, max: 1000, nullable: false },
          { id: "4", name: "category", type: "custom", options: ["Electronics", "Clothing", "Books", "Home", "Sports"], nullable: false },
          { id: "5", name: "inStock", type: "boolean", nullable: false },
          { id: "6", name: "image", type: "image", nullable: true },
        ]);
        break;
      case "posts":
        setDataFields([
          { id: "1", name: "id", type: "number", min: 1, max: 1000, nullable: false },
          { id: "2", name: "title", type: "string", length: 50, nullable: false },
          { id: "3", name: "content", type: "string", length: 200, nullable: false },
          { id: "4", name: "author", type: "fullName", nullable: false },
          { id: "5", name: "publishedAt", type: "date", nullable: false },
          { id: "6", name: "tags", type: "custom", options: ["tech", "business", "lifestyle", "travel", "food"], nullable: true },
        ]);
        break;
      case "orders":
        setDataFields([
          { id: "1", name: "orderId", type: "uuid", nullable: false },
          { id: "2", name: "customerName", type: "fullName", nullable: false },
          { id: "3", name: "total", type: "number", min: 50, max: 5000, nullable: false },
          { id: "4", name: "status", type: "custom", options: ["pending", "processing", "shipped", "delivered", "cancelled"], nullable: false },
          { id: "5", name: "orderDate", type: "date", nullable: false },
          { id: "6", name: "shippingAddress", type: "address", nullable: false },
        ]);
        break;
    }
    toast({
      title: "Template Loaded",
      description: `Loaded ${template} template`,
    });
  };

  const currentEndpointData = endpoints.find(ep => ep.id === currentEndpoint);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Fake JSON API Generator
          </CardTitle>
          <CardDescription>
            Generate realistic mock JSON API responses for testing and development
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Endpoints Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  API Endpoints
                </span>
                <Button size="sm" onClick={addEndpoint} data-testid="button-add-endpoint">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Endpoint
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentEndpoint === endpoint.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`} onClick={() => setCurrentEndpoint(endpoint.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                        <span className="text-sm text-gray-600">{endpoint.name}</span>
                      </div>
                      {endpoints.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEndpoint(endpoint.id);
                          }}
                          data-testid={`button-remove-endpoint-${endpoint.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {currentEndpointData && (
                <div className="mt-4 space-y-3">
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="endpoint-name">Endpoint Name</Label>
                      <Input
                        id="endpoint-name"
                        value={currentEndpointData.name}
                        onChange={(e) => updateEndpoint(currentEndpoint, { name: e.target.value })}
                        data-testid="input-endpoint-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endpoint-method">Method</Label>
                      <Select 
                        value={currentEndpointData.method} 
                        onValueChange={(value) => updateEndpoint(currentEndpoint, { method: value })}
                      >
                        <SelectTrigger data-testid="select-endpoint-method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {httpMethods.map((method) => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endpoint-path">Path</Label>
                    <Input
                      id="endpoint-path"
                      value={currentEndpointData.path}
                      onChange={(e) => updateEndpoint(currentEndpoint, { path: e.target.value })}
                      placeholder="/api/endpoint"
                      data-testid="input-endpoint-path"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endpoint-description">Description</Label>
                    <Input
                      id="endpoint-description"
                      value={currentEndpointData.description}
                      onChange={(e) => updateEndpoint(currentEndpoint, { description: e.target.value })}
                      placeholder="Endpoint description"
                      data-testid="input-endpoint-description"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Schema Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Response Schema</span>
                <div className="flex gap-2">
                  <Select onValueChange={loadTemplate}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Load template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="products">Products</SelectItem>
                      <SelectItem value="posts">Blog Posts</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={addDataField} data-testid="button-add-field">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Field
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-3">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        <Label htmlFor={`field-name-${index}`} className="text-xs">Field Name</Label>
                        <Input
                          id={`field-name-${index}`}
                          value={field.name}
                          onChange={(e) => updateDataField(field.id, { name: e.target.value })}
                          placeholder="fieldName"
                          className="text-sm"
                          data-testid={`input-field-name-${index}`}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`field-type-${index}`} className="text-xs">Type</Label>
                        <Select 
                          value={field.type} 
                          onValueChange={(value) => updateDataField(field.id, { type: value })}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dataTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Type-specific options */}
                      <div className="col-span-4">
                        {dataTypes.find(t => t.value === field.type)?.hasRange && (
                          <div className="flex gap-1">
                            <div>
                              <Label className="text-xs">Min</Label>
                              <Input
                                type="number"
                                value={field.min || 0}
                                onChange={(e) => updateDataField(field.id, { min: parseInt(e.target.value) })}
                                className="text-sm"
                                data-testid={`input-field-min-${index}`}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Max</Label>
                              <Input
                                type="number"
                                value={field.max || 100}
                                onChange={(e) => updateDataField(field.id, { max: parseInt(e.target.value) })}
                                className="text-sm"
                                data-testid={`input-field-max-${index}`}
                              />
                            </div>
                          </div>
                        )}
                        
                        {dataTypes.find(t => t.value === field.type)?.hasLength && (
                          <div>
                            <Label className="text-xs">Length</Label>
                            <Input
                              type="number"
                              value={field.length || 10}
                              onChange={(e) => updateDataField(field.id, { length: parseInt(e.target.value) })}
                              className="text-sm"
                              data-testid={`input-field-length-${index}`}
                            />
                          </div>
                        )}
                        
                        {dataTypes.find(t => t.value === field.type)?.hasOptions && (
                          <div>
                            <Label className="text-xs">Options (comma-separated)</Label>
                            <Input
                              value={field.options?.join(', ') || ''}
                              onChange={(e) => updateDataField(field.id, { 
                                options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                              })}
                              placeholder="option1, option2, option3"
                              className="text-sm"
                              data-testid={`input-field-options-${index}`}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-1 flex items-center">
                        <div className="text-center">
                          <Label className="text-xs">Nullable</Label>
                          <div className="mt-1">
                            <Switch
                              checked={field.nullable}
                              onCheckedChange={(checked) => updateDataField(field.id, { nullable: checked })}
                              data-testid={`switch-field-nullable-${index}`}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDataField(field.id)}
                          data-testid={`button-remove-field-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation & Output Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="record-count">Number of Records</Label>
                <Input
                  id="record-count"
                  type="number"
                  min="1"
                  max="1000"
                  value={recordCount}
                  onChange={(e) => setRecordCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                  data-testid="input-record-count"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-metadata">Include Metadata</Label>
                  <Switch
                    id="include-metadata"
                    checked={includeMetadata}
                    onCheckedChange={setIncludeMetadata}
                    data-testid="switch-include-metadata"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-pagination">Include Pagination</Label>
                  <Switch
                    id="include-pagination"
                    checked={includePagination}
                    onCheckedChange={setIncludePagination}
                    data-testid="switch-include-pagination"
                  />
                </div>
              </div>

              <Button
                onClick={generateJsonData}
                disabled={isGenerating || dataFields.length === 0}
                className="w-full"
                data-testid="button-generate-json"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate JSON
                  </>
                )}
              </Button>

              {generatedJson && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(generatedJson, "JSON data")}
                    className="flex-1"
                    data-testid="button-copy-json"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportJson}
                    className="flex-1"
                    data-testid="button-export-json"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {generatedJson && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  Generated Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(generatedJson, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Records: {Array.isArray(generatedJson.data) ? generatedJson.data.length : 0}</span>
                    <span>Size: {(JSON.stringify(generatedJson).length / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FakeJsonApi;