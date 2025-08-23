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
import { Copy, Plus, Trash2, Download, FileText, Code, Database, Globe, Settings, Zap, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiInfo {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  contact?: {
    name: string;
    email: string;
    url: string;
  };
  license?: {
    name: string;
    url: string;
  };
}

interface Parameter {
  id: string;
  name: string;
  in: "query" | "path" | "header" | "cookie";
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

interface RequestBody {
  contentType: string;
  schema: string;
  example?: string;
  required: boolean;
}

interface Response {
  id: string;
  statusCode: string;
  description: string;
  contentType: string;
  schema?: string;
  example?: string;
}

interface ApiEndpoint {
  id: string;
  path: string;
  method: string;
  summary: string;
  description: string;
  tags: string[];
  parameters: Parameter[];
  requestBody?: RequestBody;
  responses: Response[];
  security: string[];
}

interface SchemaProperty {
  id: string;
  name: string;
  type: string;
  format?: string;
  required: boolean;
  description: string;
  example?: string;
  enum?: string[];
  items?: string; // For arrays
}

interface Schema {
  id: string;
  name: string;
  type: "object" | "array" | "string" | "number" | "boolean";
  description: string;
  properties: SchemaProperty[];
  required: string[];
}

const SwaggerGenerator = () => {
  const [apiInfo, setApiInfo] = useState<ApiInfo>({
    title: "My API",
    version: "1.0.0",
    description: "API documentation generated with Swagger Generator",
    baseUrl: "https://api.example.com",
  });

  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [currentTab, setCurrentTab] = useState("info");
  const [generatedSwagger, setGeneratedSwagger] = useState<any>(null);
  const { toast } = useToast();

  const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
  const parameterTypes = ["string", "number", "integer", "boolean", "array", "object"];
  const parameterLocations = ["query", "path", "header", "cookie"];
  const responseStatusCodes = ["200", "201", "204", "400", "401", "403", "404", "422", "500"];
  const contentTypes = ["application/json", "application/xml", "text/plain", "multipart/form-data", "application/x-www-form-urlencoded"];

  // Schema management
  const addSchema = () => {
    const newSchema: Schema = {
      id: Date.now().toString(),
      name: "NewModel",
      type: "object",
      description: "A new data model",
      properties: [],
      required: []
    };
    setSchemas([...schemas, newSchema]);
  };

  const updateSchema = (id: string, updates: Partial<Schema>) => {
    setSchemas(schemas.map(schema => schema.id === id ? { ...schema, ...updates } : schema));
  };

  const removeSchema = (id: string) => {
    setSchemas(schemas.filter(schema => schema.id !== id));
  };

  const addSchemaProperty = (schemaId: string) => {
    const newProperty: SchemaProperty = {
      id: Date.now().toString(),
      name: "newProperty",
      type: "string",
      required: false,
      description: "Property description"
    };
    
    setSchemas(schemas.map(schema => 
      schema.id === schemaId 
        ? { ...schema, properties: [...schema.properties, newProperty] }
        : schema
    ));
  };

  const updateSchemaProperty = (schemaId: string, propertyId: string, updates: Partial<SchemaProperty>) => {
    setSchemas(schemas.map(schema => 
      schema.id === schemaId 
        ? {
            ...schema,
            properties: schema.properties.map(prop => 
              prop.id === propertyId ? { ...prop, ...updates } : prop
            )
          }
        : schema
    ));
  };

  const removeSchemaProperty = (schemaId: string, propertyId: string) => {
    setSchemas(schemas.map(schema => 
      schema.id === schemaId 
        ? { ...schema, properties: schema.properties.filter(prop => prop.id !== propertyId) }
        : schema
    ));
  };

  // Endpoint management
  const addEndpoint = () => {
    const newEndpoint: ApiEndpoint = {
      id: Date.now().toString(),
      path: "/api/resource",
      method: "GET",
      summary: "Get resource",
      description: "Retrieve a resource",
      tags: ["default"],
      parameters: [],
      responses: [{
        id: Date.now().toString() + "_response",
        statusCode: "200",
        description: "Success",
        contentType: "application/json"
      }],
      security: []
    };
    setEndpoints([...endpoints, newEndpoint]);
  };

  const updateEndpoint = (id: string, updates: Partial<ApiEndpoint>) => {
    setEndpoints(endpoints.map(endpoint => endpoint.id === id ? { ...endpoint, ...updates } : endpoint));
  };

  const removeEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(endpoint => endpoint.id !== id));
  };

  const addParameter = (endpointId: string) => {
    const newParameter: Parameter = {
      id: Date.now().toString(),
      name: "param",
      in: "query",
      type: "string",
      required: false,
      description: "Parameter description"
    };
    
    setEndpoints(endpoints.map(endpoint => 
      endpoint.id === endpointId 
        ? { ...endpoint, parameters: [...endpoint.parameters, newParameter] }
        : endpoint
    ));
  };

  const updateParameter = (endpointId: string, parameterId: string, updates: Partial<Parameter>) => {
    setEndpoints(endpoints.map(endpoint => 
      endpoint.id === endpointId 
        ? {
            ...endpoint,
            parameters: endpoint.parameters.map(param => 
              param.id === parameterId ? { ...param, ...updates } : param
            )
          }
        : endpoint
    ));
  };

  const removeParameter = (endpointId: string, parameterId: string) => {
    setEndpoints(endpoints.map(endpoint => 
      endpoint.id === endpointId 
        ? { ...endpoint, parameters: endpoint.parameters.filter(param => param.id !== parameterId) }
        : endpoint
    ));
  };

  const addResponse = (endpointId: string) => {
    const newResponse: Response = {
      id: Date.now().toString(),
      statusCode: "200",
      description: "Success response",
      contentType: "application/json"
    };
    
    setEndpoints(endpoints.map(endpoint => 
      endpoint.id === endpointId 
        ? { ...endpoint, responses: [...endpoint.responses, newResponse] }
        : endpoint
    ));
  };

  const updateResponse = (endpointId: string, responseId: string, updates: Partial<Response>) => {
    setEndpoints(endpoints.map(endpoint => 
      endpoint.id === endpointId 
        ? {
            ...endpoint,
            responses: endpoint.responses.map(response => 
              response.id === responseId ? { ...response, ...updates } : response
            )
          }
        : endpoint
    ));
  };

  const removeResponse = (endpointId: string, responseId: string) => {
    setEndpoints(endpoints.map(endpoint => 
      endpoint.id === endpointId 
        ? { ...endpoint, responses: endpoint.responses.filter(response => response.id !== responseId) }
        : endpoint
    ));
  };

  const generateSwaggerDoc = () => {
    // Build OpenAPI 3.0 specification
    const swaggerDoc: any = {
      openapi: "3.0.0",
      info: {
        title: apiInfo.title,
        version: apiInfo.version,
        description: apiInfo.description,
      },
      servers: [
        {
          url: apiInfo.baseUrl,
          description: "API Server"
        }
      ],
      paths: {},
      components: {
        schemas: {}
      }
    };

    // Add contact and license if provided
    if (apiInfo.contact && (apiInfo.contact.name || apiInfo.contact.email)) {
      swaggerDoc.info.contact = {};
      if (apiInfo.contact.name) swaggerDoc.info.contact.name = apiInfo.contact.name;
      if (apiInfo.contact.email) swaggerDoc.info.contact.email = apiInfo.contact.email;
      if (apiInfo.contact.url) swaggerDoc.info.contact.url = apiInfo.contact.url;
    }

    if (apiInfo.license && apiInfo.license.name) {
      swaggerDoc.info.license = {
        name: apiInfo.license.name,
        url: apiInfo.license.url
      };
    }

    // Add schemas to components
    schemas.forEach(schema => {
      const schemaDefinition: any = {
        type: schema.type,
        description: schema.description,
      };

      if (schema.type === "object") {
        schemaDefinition.properties = {};
        schemaDefinition.required = [];

        schema.properties.forEach(prop => {
          const propDef: any = {
            type: prop.type,
            description: prop.description
          };

          if (prop.format) propDef.format = prop.format;
          if (prop.example) propDef.example = prop.example;
          if (prop.enum) propDef.enum = prop.enum;
          if (prop.type === "array" && prop.items) {
            propDef.items = { $ref: `#/components/schemas/${prop.items}` };
          }

          schemaDefinition.properties[prop.name] = propDef;
          
          if (prop.required) {
            schemaDefinition.required.push(prop.name);
          }
        });
      }

      swaggerDoc.components.schemas[schema.name] = schemaDefinition;
    });

    // Add paths/endpoints
    endpoints.forEach(endpoint => {
      if (!swaggerDoc.paths[endpoint.path]) {
        swaggerDoc.paths[endpoint.path] = {};
      }

      const operation: any = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags.length > 0 ? endpoint.tags : ["default"],
        parameters: [],
        responses: {}
      };

      // Add parameters
      endpoint.parameters.forEach(param => {
        const paramDef: any = {
          name: param.name,
          in: param.in,
          required: param.required,
          description: param.description,
          schema: {
            type: param.type
          }
        };

        if (param.example) paramDef.example = param.example;
        operation.parameters.push(paramDef);
      });

      // Add request body
      if (endpoint.requestBody) {
        operation.requestBody = {
          required: endpoint.requestBody.required,
          content: {
            [endpoint.requestBody.contentType]: {
              schema: endpoint.requestBody.schema.startsWith('#/') 
                ? { $ref: endpoint.requestBody.schema }
                : { type: endpoint.requestBody.schema }
            }
          }
        };

        if (endpoint.requestBody.example) {
          operation.requestBody.content[endpoint.requestBody.contentType].example = endpoint.requestBody.example;
        }
      }

      // Add responses
      endpoint.responses.forEach(response => {
        const responseDef: any = {
          description: response.description
        };

        if (response.contentType && response.schema) {
          responseDef.content = {
            [response.contentType]: {
              schema: response.schema.startsWith('#/') 
                ? { $ref: response.schema }
                : { type: response.schema }
            }
          };

          if (response.example) {
            responseDef.content[response.contentType].example = response.example;
          }
        }

        operation.responses[response.statusCode] = responseDef;
      });

      swaggerDoc.paths[endpoint.path][endpoint.method.toLowerCase()] = operation;
    });

    setGeneratedSwagger(swaggerDoc);
    
    toast({
      title: "Swagger Generated!",
      description: "OpenAPI specification has been generated successfully",
    });
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

  const exportSwagger = (format: 'json' | 'yaml') => {
    if (!generatedSwagger) {
      toast({
        title: "No Documentation",
        description: "Please generate Swagger documentation first",
        variant: "destructive",
      });
      return;
    }

    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(generatedSwagger, null, 2);
      filename = 'swagger.json';
    } else {
      // Convert to YAML (basic implementation)
      content = convertToYaml(generatedSwagger);
      filename = 'swagger.yaml';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: `Swagger documentation exported as ${format.toUpperCase()}`,
    });
  };

  // Basic YAML conversion (simplified)
  const convertToYaml = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${convertToYaml(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${convertToYaml(item, indent + 2)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else {
        yaml += `${spaces}${key}: ${typeof value === 'string' ? `"${value}"` : value}\n`;
      }
    }

    return yaml;
  };

  const loadTemplate = (template: string) => {
    switch (template) {
      case "rest-api":
        setApiInfo({
          title: "REST API",
          version: "1.0.0",
          description: "A RESTful API for managing resources",
          baseUrl: "https://api.example.com/v1"
        });
        setSchemas([
          {
            id: "1",
            name: "User",
            type: "object",
            description: "User object",
            properties: [
              { id: "1", name: "id", type: "integer", required: true, description: "User ID" },
              { id: "2", name: "name", type: "string", required: true, description: "User name" },
              { id: "3", name: "email", type: "string", format: "email", required: true, description: "User email" }
            ],
            required: ["id", "name", "email"]
          }
        ]);
        setEndpoints([
          {
            id: "1",
            path: "/users",
            method: "GET",
            summary: "Get all users",
            description: "Retrieve a list of all users",
            tags: ["Users"],
            parameters: [
              { id: "1", name: "page", in: "query", type: "integer", required: false, description: "Page number" },
              { id: "2", name: "limit", in: "query", type: "integer", required: false, description: "Items per page" }
            ],
            responses: [
              { id: "1", statusCode: "200", description: "Success", contentType: "application/json", schema: "#/components/schemas/User" }
            ],
            security: []
          }
        ]);
        break;
      case "microservice":
        setApiInfo({
          title: "Microservice API",
          version: "2.0.0",
          description: "Microservice for order management",
          baseUrl: "https://orders.api.example.com"
        });
        setSchemas([
          {
            id: "1",
            name: "Order",
            type: "object",
            description: "Order object",
            properties: [
              { id: "1", name: "orderId", type: "string", required: true, description: "Order ID" },
              { id: "2", name: "customerId", type: "string", required: true, description: "Customer ID" },
              { id: "3", name: "status", type: "string", enum: ["pending", "processing", "shipped", "delivered"], required: true, description: "Order status" },
              { id: "4", name: "total", type: "number", format: "float", required: true, description: "Order total" }
            ],
            required: ["orderId", "customerId", "status", "total"]
          }
        ]);
        break;
    }
    
    toast({
      title: "Template Loaded",
      description: `Loaded ${template} template`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Swagger/OpenAPI Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive API documentation from endpoints and data models
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">API Info</TabsTrigger>
              <TabsTrigger value="schemas">Schemas</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* API Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>API Information</span>
                    <div className="flex gap-2">
                      <Select onValueChange={loadTemplate}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Load template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rest-api">REST API</SelectItem>
                          <SelectItem value="microservice">Microservice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="api-title">API Title *</Label>
                      <Input
                        id="api-title"
                        value={apiInfo.title}
                        onChange={(e) => setApiInfo(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="My API"
                        data-testid="input-api-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="api-version">Version *</Label>
                      <Input
                        id="api-version"
                        value={apiInfo.version}
                        onChange={(e) => setApiInfo(prev => ({ ...prev, version: e.target.value }))}
                        placeholder="1.0.0"
                        data-testid="input-api-version"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="api-description">Description</Label>
                    <Textarea
                      id="api-description"
                      value={apiInfo.description}
                      onChange={(e) => setApiInfo(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="API description..."
                      rows={3}
                      data-testid="textarea-api-description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="api-base-url">Base URL *</Label>
                    <Input
                      id="api-base-url"
                      value={apiInfo.baseUrl}
                      onChange={(e) => setApiInfo(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="https://api.example.com"
                      data-testid="input-api-base-url"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Contact Information</Label>
                      <div className="space-y-2 mt-2">
                        <Input
                          placeholder="Contact name"
                          value={apiInfo.contact?.name || ''}
                          onChange={(e) => setApiInfo(prev => ({ 
                            ...prev, 
                            contact: { ...prev.contact, name: e.target.value }
                          }))}
                          data-testid="input-contact-name"
                        />
                        <Input
                          placeholder="Contact email"
                          value={apiInfo.contact?.email || ''}
                          onChange={(e) => setApiInfo(prev => ({ 
                            ...prev, 
                            contact: { ...prev.contact, email: e.target.value }
                          }))}
                          data-testid="input-contact-email"
                        />
                        <Input
                          placeholder="Contact URL"
                          value={apiInfo.contact?.url || ''}
                          onChange={(e) => setApiInfo(prev => ({ 
                            ...prev, 
                            contact: { ...prev.contact, url: e.target.value }
                          }))}
                          data-testid="input-contact-url"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">License Information</Label>
                      <div className="space-y-2 mt-2">
                        <Input
                          placeholder="License name"
                          value={apiInfo.license?.name || ''}
                          onChange={(e) => setApiInfo(prev => ({ 
                            ...prev, 
                            license: { ...prev.license, name: e.target.value }
                          }))}
                          data-testid="input-license-name"
                        />
                        <Input
                          placeholder="License URL"
                          value={apiInfo.license?.url || ''}
                          onChange={(e) => setApiInfo(prev => ({ 
                            ...prev, 
                            license: { ...prev.license, url: e.target.value }
                          }))}
                          data-testid="input-license-url"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schemas Tab */}
            <TabsContent value="schemas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Data Models/Schemas
                    </span>
                    <Button size="sm" onClick={addSchema} data-testid="button-add-schema">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Schema
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {schemas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No schemas defined yet</p>
                      <p className="text-sm">Add schemas to define your data models</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {schemas.map((schema) => (
                        <div key={schema.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Input
                                value={schema.name}
                                onChange={(e) => updateSchema(schema.id, { name: e.target.value })}
                                className="font-medium"
                                data-testid={`input-schema-name-${schema.id}`}
                              />
                              <Badge variant="outline">{schema.type}</Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSchema(schema.id)}
                              data-testid={`button-remove-schema-${schema.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="mb-4">
                            <Textarea
                              value={schema.description}
                              onChange={(e) => updateSchema(schema.id, { description: e.target.value })}
                              placeholder="Schema description..."
                              rows={2}
                              data-testid={`textarea-schema-description-${schema.id}`}
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Properties</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addSchemaProperty(schema.id)}
                                data-testid={`button-add-property-${schema.id}`}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Property
                              </Button>
                            </div>

                            {schema.properties.map((property) => (
                              <div key={property.id} className="grid grid-cols-12 gap-2 items-end p-2 bg-gray-50 rounded">
                                <div className="col-span-3">
                                  <Input
                                    placeholder="Property name"
                                    value={property.name}
                                    onChange={(e) => updateSchemaProperty(schema.id, property.id, { name: e.target.value })}
                                    data-testid={`input-property-name-${property.id}`}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Select 
                                    value={property.type} 
                                    onValueChange={(value) => updateSchemaProperty(schema.id, property.id, { type: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {parameterTypes.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    placeholder="Description"
                                    value={property.description}
                                    onChange={(e) => updateSchemaProperty(schema.id, property.id, { description: e.target.value })}
                                    data-testid={`input-property-description-${property.id}`}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Input
                                    placeholder="Example"
                                    value={property.example || ''}
                                    onChange={(e) => updateSchemaProperty(schema.id, property.id, { example: e.target.value })}
                                    data-testid={`input-property-example-${property.id}`}
                                  />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  <Switch
                                    checked={property.required}
                                    onCheckedChange={(checked) => updateSchemaProperty(schema.id, property.id, { required: checked })}
                                    data-testid={`switch-property-required-${property.id}`}
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeSchemaProperty(schema.id, property.id)}
                                    data-testid={`button-remove-property-${property.id}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Endpoints Tab */}
            <TabsContent value="endpoints" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      API Endpoints
                    </span>
                    <Button size="sm" onClick={addEndpoint} data-testid="button-add-endpoint">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Endpoint
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {endpoints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No endpoints defined yet</p>
                      <p className="text-sm">Add endpoints to define your API operations</p>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {endpoints.map((endpoint) => (
                        <div key={endpoint.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm">{endpoint.path}</code>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeEndpoint(endpoint.id)}
                              data-testid={`button-remove-endpoint-${endpoint.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Method</Label>
                              <Select 
                                value={endpoint.method} 
                                onValueChange={(value) => updateEndpoint(endpoint.id, { method: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {httpMethods.map((method) => (
                                    <SelectItem key={method} value={method}>{method}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Path</Label>
                              <Input
                                value={endpoint.path}
                                onChange={(e) => updateEndpoint(endpoint.id, { path: e.target.value })}
                                placeholder="/api/resource"
                                data-testid={`input-endpoint-path-${endpoint.id}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                              <Label>Summary</Label>
                              <Input
                                value={endpoint.summary}
                                onChange={(e) => updateEndpoint(endpoint.id, { summary: e.target.value })}
                                placeholder="Brief summary"
                                data-testid={`input-endpoint-summary-${endpoint.id}`}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={endpoint.description}
                                onChange={(e) => updateEndpoint(endpoint.id, { description: e.target.value })}
                                placeholder="Detailed description..."
                                rows={2}
                                data-testid={`textarea-endpoint-description-${endpoint.id}`}
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <Label>Tags (comma-separated)</Label>
                            <Input
                              value={endpoint.tags.join(', ')}
                              onChange={(e) => updateEndpoint(endpoint.id, { 
                                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                              })}
                              placeholder="users, auth, admin"
                              data-testid={`input-endpoint-tags-${endpoint.id}`}
                            />
                          </div>

                          {/* Parameters section would go here - simplified for space */}
                          {/* Responses section would go here - simplified for space */}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Documentation Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedSwagger ? (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(generatedSwagger, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documentation generated yet</p>
                      <p className="text-sm">Click "Generate Documentation" to preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Generation Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={generateSwaggerDoc}
                className="w-full"
                data-testid="button-generate-swagger"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Documentation
              </Button>

              {generatedSwagger && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(generatedSwagger, "Swagger documentation")}
                    className="w-full"
                    data-testid="button-copy-swagger"
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy JSON
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => exportSwagger('json')}
                      className="flex-1"
                      data-testid="button-export-json"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportSwagger('yaml')}
                      className="flex-1"
                      data-testid="button-export-yaml"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      YAML
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {generatedSwagger && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Documentation Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Endpoints:</span>
                    <span>{endpoints.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schemas:</span>
                    <span>{schemas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{(JSON.stringify(generatedSwagger).length / 1024).toFixed(1)} KB</span>
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

export default SwaggerGenerator;