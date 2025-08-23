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
import { Copy, Plus, Trash2, Terminal, Code, Download, RefreshCw, Globe, Key, FileText, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

const ApiCliGenerator = () => {
  const [url, setUrl] = useState("https://api.example.com/users");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState<Header[]>([
    { key: "Content-Type", value: "application/json", enabled: true },
    { key: "Authorization", value: "Bearer YOUR_TOKEN", enabled: false },
  ]);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { key: "page", value: "1", enabled: false },
    { key: "limit", value: "10", enabled: false },
  ]);
  const [requestBody, setRequestBody] = useState('{\n  "name": "John Doe",\n  "email": "john@example.com"\n}');
  const [authType, setAuthType] = useState("none");
  const [authToken, setAuthToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [followRedirects, setFollowRedirects] = useState(true);
  const [showVerbose, setShowVerbose] = useState(false);
  const [timeout, setTimeout] = useState("30");
  const [activeTab, setActiveTab] = useState("curl");
  const { toast } = useToast();

  const httpMethods = [
    "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"
  ];

  const authTypes = [
    { value: "none", label: "None" },
    { value: "bearer", label: "Bearer Token" },
    { value: "basic", label: "Basic Auth" },
    { value: "api-key", label: "API Key" },
  ];

  const commonHeaders = [
    "Accept",
    "Accept-Language",
    "Authorization", 
    "Cache-Control",
    "Content-Type",
    "User-Agent",
    "X-API-Key",
    "X-Requested-With",
  ];

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "", enabled: true }]);
  };

  const updateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "", enabled: true }]);
  };

  const updateQueryParam = (index: number, field: keyof QueryParam, value: string | boolean) => {
    const newParams = [...queryParams];
    newParams[index] = { ...newParams[index], [field]: value };
    setQueryParams(newParams);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const buildUrl = () => {
    const enabledParams = queryParams.filter(param => param.enabled && param.key && param.value);
    if (enabledParams.length === 0) return url;
    
    const queryString = enabledParams
      .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
      .join('&');
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${queryString}`;
  };

  const generateCurlCommand = () => {
    const finalUrl = buildUrl();
    let command = `curl`;
    
    if (showVerbose) {
      command += ` -v`;
    }
    
    if (followRedirects) {
      command += ` -L`;
    }
    
    if (timeout) {
      command += ` --max-time ${timeout}`;
    }
    
    command += ` -X ${method}`;
    
    // Add headers
    const enabledHeaders = headers.filter(header => header.enabled && header.key && header.value);
    enabledHeaders.forEach(header => {
      command += ` \\\n  -H "${header.key}: ${header.value}"`;
    });
    
    // Add authentication
    if (authType === "bearer" && authToken) {
      command += ` \\\n  -H "Authorization: Bearer ${authToken}"`;
    } else if (authType === "basic" && username && password) {
      command += ` \\\n  -u "${username}:${password}"`;
    } else if (authType === "api-key" && authToken) {
      command += ` \\\n  -H "X-API-Key: ${authToken}"`;
    }
    
    // Add request body for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(method) && requestBody) {
      command += ` \\\n  -d '${requestBody}'`;
    }
    
    command += ` \\\n  "${finalUrl}"`;
    
    return command;
  };

  const generateHttpieCommand = () => {
    const finalUrl = buildUrl();
    let command = `http`;
    
    if (showVerbose) {
      command += ` --verbose`;
    }
    
    if (followRedirects) {
      command += ` --follow`;
    }
    
    if (timeout) {
      command += ` --timeout=${timeout}`;
    }
    
    command += ` ${method}`;
    command += ` "${finalUrl}"`;
    
    // Add headers
    const enabledHeaders = headers.filter(header => header.enabled && header.key && header.value);
    enabledHeaders.forEach(header => {
      command += ` \\\n  "${header.key}:${header.value}"`;
    });
    
    // Add authentication
    if (authType === "bearer" && authToken) {
      command += ` \\\n  "Authorization:Bearer ${authToken}"`;
    } else if (authType === "basic" && username && password) {
      command += ` \\\n  --auth "${username}:${password}"`;
    } else if (authType === "api-key" && authToken) {
      command += ` \\\n  "X-API-Key:${authToken}"`;
    }
    
    // Add request body for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(method) && requestBody) {
      try {
        const jsonBody = JSON.parse(requestBody);
        Object.entries(jsonBody).forEach(([key, value]) => {
          command += ` \\\n  "${key}:=${JSON.stringify(value)}"`;
        });
      } catch {
        // If not valid JSON, treat as raw data
        command += ` \\\n  --raw '${requestBody}'`;
      }
    }
    
    return command;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

  const loadExample = (exampleType: string) => {
    switch (exampleType) {
      case "get-api":
        setUrl("https://jsonplaceholder.typicode.com/users/1");
        setMethod("GET");
        setHeaders([
          { key: "Accept", value: "application/json", enabled: true },
        ]);
        setQueryParams([]);
        setRequestBody("");
        setAuthType("none");
        break;
      case "post-json":
        setUrl("https://jsonplaceholder.typicode.com/posts");
        setMethod("POST");
        setHeaders([
          { key: "Content-Type", value: "application/json", enabled: true },
        ]);
        setQueryParams([]);
        setRequestBody('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
        setAuthType("none");
        break;
      case "auth-bearer":
        setUrl("https://api.github.com/user");
        setMethod("GET");
        setHeaders([
          { key: "Accept", value: "application/vnd.github.v3+json", enabled: true },
        ]);
        setQueryParams([]);
        setRequestBody("");
        setAuthType("bearer");
        setAuthToken("ghp_xxxxxxxxxxxxxxxxxxxx");
        break;
      case "form-data":
        setUrl("https://httpbin.org/post");
        setMethod("POST");
        setHeaders([
          { key: "Content-Type", value: "application/x-www-form-urlencoded", enabled: true },
        ]);
        setQueryParams([]);
        setRequestBody("name=John+Doe&email=john%40example.com");
        setAuthType("none");
        break;
    }
    toast({
      title: "Example Loaded",
      description: `Loaded ${exampleType} example`,
    });
  };

  const exportCommand = (command: string, filename: string) => {
    const blob = new Blob([command], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: `Command exported as ${filename}`,
    });
  };

  const curlCommand = generateCurlCommand();
  const httpieCommand = generateHttpieCommand();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            API CLI Generator (cURL & HTTPie)
          </CardTitle>
          <CardDescription>
            Generate command-line tools for testing APIs with cURL and HTTPie
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Examples */}
              <div>
                <Label className="text-sm font-medium">Quick Examples</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample("get-api")}
                    data-testid="button-example-get"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    GET API
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample("post-json")}
                    data-testid="button-example-post"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    POST JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample("auth-bearer")}
                    data-testid="button-example-auth"
                  >
                    <Key className="h-3 w-3 mr-1" />
                    Bearer Auth
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample("form-data")}
                    data-testid="button-example-form"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Form Data
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Basic Request */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label htmlFor="method">Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger data-testid="select-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {httpMethods.map((m) => (
                        <SelectItem key={m} value={m}>
                          <Badge variant={m === "GET" ? "default" : m === "POST" ? "secondary" : "outline"}>
                            {m}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    data-testid="input-url"
                  />
                </div>
              </div>

              {/* Query Parameters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Query Parameters</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addQueryParam}
                    data-testid="button-add-param"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {queryParams.map((param, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Switch
                        checked={param.enabled}
                        onCheckedChange={(checked) => updateQueryParam(index, "enabled", checked)}
                        data-testid={`switch-param-${index}`}
                      />
                      <Input
                        placeholder="Key"
                        value={param.key}
                        onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                        className="flex-1"
                        data-testid={`input-param-key-${index}`}
                      />
                      <Input
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => updateQueryParam(index, "value", e.target.value)}
                        className="flex-1"
                        data-testid={`input-param-value-${index}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQueryParam(index)}
                        data-testid={`button-remove-param-${index}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Headers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Headers</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addHeader}
                    data-testid="button-add-header"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Switch
                        checked={header.enabled}
                        onCheckedChange={(checked) => updateHeader(index, "enabled", checked)}
                        data-testid={`switch-header-${index}`}
                      />
                      <Select
                        value={header.key}
                        onValueChange={(value) => updateHeader(index, "key", value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Header name" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonHeaders.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateHeader(index, "value", e.target.value)}
                        className="flex-1"
                        data-testid={`input-header-value-${index}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHeader(index)}
                        data-testid={`button-remove-header-${index}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authentication */}
              <div>
                <Label className="text-sm font-medium">Authentication</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Select value={authType} onValueChange={setAuthType}>
                    <SelectTrigger data-testid="select-auth-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {authTypes.map((auth) => (
                        <SelectItem key={auth.value} value={auth.value}>
                          {auth.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {authType === "bearer" && (
                    <Input
                      placeholder="Bearer token"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      data-testid="input-bearer-token"
                    />
                  )}
                  
                  {authType === "api-key" && (
                    <Input
                      placeholder="API key"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      data-testid="input-api-key"
                    />
                  )}
                </div>
                
                {authType === "basic" && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      data-testid="input-username"
                    />
                    <Input
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-password"
                    />
                  </div>
                )}
              </div>

              {/* Request Body */}
              {["POST", "PUT", "PATCH"].includes(method) && (
                <div>
                  <Label htmlFor="body">Request Body</Label>
                  <Textarea
                    id="body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder="JSON, form data, or raw text..."
                    rows={6}
                    className="font-mono text-sm"
                    data-testid="textarea-request-body"
                  />
                </div>
              )}

              {/* Options */}
              <div>
                <Label className="text-sm font-medium">Options</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="follow-redirects"
                        checked={followRedirects}
                        onCheckedChange={setFollowRedirects}
                        data-testid="switch-follow-redirects"
                      />
                      <Label htmlFor="follow-redirects">Follow redirects</Label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="verbose"
                        checked={showVerbose}
                        onCheckedChange={setShowVerbose}
                        data-testid="switch-verbose"
                      />
                      <Label htmlFor="verbose">Verbose output</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="timeout" className="text-sm">Timeout (seconds):</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={timeout}
                      onChange={(e) => setTimeout(e.target.value)}
                      className="w-20"
                      data-testid="input-timeout"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Commands Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Commands</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCommand(activeTab === "curl" ? curlCommand : httpieCommand, `api-test.${activeTab}.sh`)}
                  data-testid="button-export-command"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="curl" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  cURL
                </TabsTrigger>
                <TabsTrigger value="httpie" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  HTTPie
                </TabsTrigger>
              </TabsList>

              <TabsContent value="curl" className="space-y-4">
                <div className="relative">
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all">{curlCommand}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(curlCommand, "cURL command")}
                    data-testid="button-copy-curl"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>cURL</strong> is available on most systems by default. Install with:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded">apt install curl</code> or <code className="bg-gray-100 px-2 py-1 rounded">brew install curl</code>
                </div>
              </TabsContent>

              <TabsContent value="httpie" className="space-y-4">
                <div className="relative">
                  <div className="bg-gray-900 text-blue-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all">{httpieCommand}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(httpieCommand, "HTTPie command")}
                    data-testid="button-copy-httpie"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>HTTPie</strong> is a user-friendly command-line HTTP client. Install with:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded">pip install httpie</code> or <code className="bg-gray-100 px-2 py-1 rounded">brew install httpie</code>
                </div>
              </TabsContent>
            </Tabs>

            {/* URL Preview */}
            <div className="mt-4">
              <Label className="text-sm font-medium">Final URL</Label>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <code className="text-sm break-all">{buildUrl()}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiCliGenerator;