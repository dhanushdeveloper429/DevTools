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
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name?: string;
    url?: string;
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
  const [pojoInput, setPojoInput] = useState<string>('');
  const [apiDefinitionInput, setApiDefinitionInput] = useState<string>('');
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

  // POJO to Schema conversion
  const parsePojoToSchemas = (pojoText: string) => {
    const newSchemas: Schema[] = [];
    
    // Split by class/interface definitions
    const classRegex = /(?:public\s+)?(?:class|interface)\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    
    let match;
    while ((match = classRegex.exec(pojoText)) !== null) {
      const className = match[1];
      const classBody = match[2];
      
      const schema: Schema = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: className,
        type: "object",
        description: `Generated from ${className} POJO`,
        properties: [],
        required: []
      };

      // Parse fields/properties
      const fieldRegex = /(?:private|public|protected)?\s*(\w+(?:<[\w,\s<>]+>)?)\s+(\w+)(?:\s*=\s*[^;]+)?;/g;
      
      let fieldMatch;
      while ((fieldMatch = fieldRegex.exec(classBody)) !== null) {
        const fieldType = fieldMatch[1];
        const fieldName = fieldMatch[2];
        
        const property: SchemaProperty = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: fieldName,
          type: mapJavaTypeToOpenApiType(fieldType),
          required: !fieldType.includes('?') && !fieldName.startsWith('optional'),
          description: `${fieldName} field`
        };

        // Handle special cases
        if (fieldType.includes('List<') || fieldType.includes('[]')) {
          property.type = 'array';
          const innerType = extractGenericType(fieldType) || 'string';
          property.items = mapJavaTypeToOpenApiType(innerType);
        }

        // Add examples based on field names
        if (fieldName.toLowerCase().includes('email')) {
          property.example = 'user@example.com';
          property.format = 'email';
        } else if (fieldName.toLowerCase().includes('id')) {
          property.example = '12345';
          property.type = 'integer';
        } else if (fieldName.toLowerCase().includes('name')) {
          property.example = 'John Doe';
        } else if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('time')) {
          property.format = 'date-time';
          property.example = '2023-12-25T10:30:00Z';
        }

        schema.properties.push(property);
        
        if (property.required) {
          schema.required.push(property.name);
        }
      }

      // Parse getter/setter methods for additional properties
      const methodRegex = /(?:public|private|protected)\s+(\w+(?:<[\w,\s<>]+>)?)\s+(get|set)(\w+)\s*\([^)]*\)/g;
      
      let methodMatch;
      const existingProps = new Set(schema.properties.map(p => p.name.toLowerCase()));
      
      while ((methodMatch = methodRegex.exec(classBody)) !== null) {
        const returnType = methodMatch[1];
        const methodType = methodMatch[2];
        const propertyName = methodMatch[3];
        
        if (methodType === 'get' && !existingProps.has(propertyName.toLowerCase())) {
          const property: SchemaProperty = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: propertyName.charAt(0).toLowerCase() + propertyName.slice(1),
            type: mapJavaTypeToOpenApiType(returnType),
            required: false,
            description: `${propertyName} property from getter method`
          };

          schema.properties.push(property);
          existingProps.add(propertyName.toLowerCase());
        }
      }

      newSchemas.push(schema);
    }

    return newSchemas;
  };

  const mapJavaTypeToOpenApiType = (javaType: string): string => {
    const type = javaType.toLowerCase().replace(/[<>]/g, '');
    
    if (type.includes('string')) return 'string';
    if (type.includes('int') || type.includes('long') || type.includes('short') || type.includes('byte')) return 'integer';
    if (type.includes('double') || type.includes('float') || type.includes('bigdecimal')) return 'number';
    if (type.includes('boolean')) return 'boolean';
    if (type.includes('date') || type.includes('localdate') || type.includes('localdatetime')) return 'string';
    if (type.includes('list') || type.includes('array') || type.includes('[]')) return 'array';
    if (type.includes('map') || type.includes('object')) return 'object';
    
    // If it's a custom class, assume it's an object reference
    if (type.charAt(0) === type.charAt(0).toUpperCase()) {
      return 'object';
    }
    
    return 'string'; // default
  };

  const extractGenericType = (type: string): string | null => {
    const match = type.match(/<(\w+)>/);
    return match ? match[1] : null;
  };

  const generateSchemasFromPojo = () => {
    if (!pojoInput.trim()) {
      toast({
        title: "No POJO Input",
        description: "Please provide POJO/class definitions",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSchemas = parsePojoToSchemas(pojoInput);
      
      if (newSchemas.length === 0) {
        toast({
          title: "No Classes Found",
          description: "Could not parse any class definitions from the input",
          variant: "destructive",
        });
        return;
      }

      // Add to existing schemas
      setSchemas(prev => [...prev, ...newSchemas]);
      
      // Automatically generate endpoints for the new schemas
      generateEndpointsFromSchemas(newSchemas);
      
      toast({
        title: "Schemas Generated!",
        description: `Generated ${newSchemas.length} schema(s) and corresponding endpoints`,
      });

      // Clear the input
      setPojoInput('');
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse POJO definitions. Please check the syntax.",
        variant: "destructive",
      });
    }
  };

  const generateEndpointsFromSchemas = (schemasToProcess: Schema[]) => {
    const newEndpoints: ApiEndpoint[] = [];

    schemasToProcess.forEach(schema => {
      const resourceName = schema.name.toLowerCase();
      const resourceNamePlural = resourceName + 's';

      // GET all resources
      newEndpoints.push({
        id: Date.now().toString() + '_get_all_' + resourceName,
        path: `/api/${resourceNamePlural}`,
        method: "GET",
        summary: `Get all ${resourceNamePlural}`,
        description: `Retrieve a list of all ${resourceNamePlural}`,
        tags: [schema.name],
        parameters: [
          {
            id: Date.now().toString() + '_page',
            name: 'page',
            in: 'query',
            type: 'integer',
            required: false,
            description: 'Page number for pagination'
          },
          {
            id: Date.now().toString() + '_limit',
            name: 'limit',
            in: 'query',
            type: 'integer', 
            required: false,
            description: 'Number of items per page'
          }
        ],
        responses: [
          {
            id: Date.now().toString() + '_200_get_all',
            statusCode: '200',
            description: 'Success',
            contentType: 'application/json',
            schema: `#/components/schemas/${schema.name}`
          }
        ],
        security: []
      });

      // GET single resource
      newEndpoints.push({
        id: Date.now().toString() + '_get_one_' + resourceName,
        path: `/api/${resourceNamePlural}/{id}`,
        method: "GET",
        summary: `Get ${resourceName} by ID`,
        description: `Retrieve a specific ${resourceName} by its ID`,
        tags: [schema.name],
        parameters: [
          {
            id: Date.now().toString() + '_id_path',
            name: 'id',
            in: 'path',
            type: 'integer',
            required: true,
            description: `${schema.name} ID`
          }
        ],
        responses: [
          {
            id: Date.now().toString() + '_200_get_one',
            statusCode: '200',
            description: 'Success',
            contentType: 'application/json',
            schema: `#/components/schemas/${schema.name}`
          },
          {
            id: Date.now().toString() + '_404_get_one',
            statusCode: '404',
            description: 'Resource not found',
            contentType: 'application/json'
          }
        ],
        security: []
      });

      // POST create resource
      newEndpoints.push({
        id: Date.now().toString() + '_post_' + resourceName,
        path: `/api/${resourceNamePlural}`,
        method: "POST",
        summary: `Create ${resourceName}`,
        description: `Create a new ${resourceName}`,
        tags: [schema.name],
        parameters: [],
        requestBody: {
          contentType: 'application/json',
          schema: `#/components/schemas/${schema.name}`,
          required: true
        },
        responses: [
          {
            id: Date.now().toString() + '_201_post',
            statusCode: '201',
            description: 'Created successfully',
            contentType: 'application/json',
            schema: `#/components/schemas/${schema.name}`
          },
          {
            id: Date.now().toString() + '_400_post',
            statusCode: '400',
            description: 'Bad request',
            contentType: 'application/json'
          }
        ],
        security: []
      });

      // PUT update resource
      newEndpoints.push({
        id: Date.now().toString() + '_put_' + resourceName,
        path: `/api/${resourceNamePlural}/{id}`,
        method: "PUT",
        summary: `Update ${resourceName}`,
        description: `Update an existing ${resourceName}`,
        tags: [schema.name],
        parameters: [
          {
            id: Date.now().toString() + '_id_path_put',
            name: 'id',
            in: 'path',
            type: 'integer',
            required: true,
            description: `${schema.name} ID`
          }
        ],
        requestBody: {
          contentType: 'application/json',
          schema: `#/components/schemas/${schema.name}`,
          required: true
        },
        responses: [
          {
            id: Date.now().toString() + '_200_put',
            statusCode: '200',
            description: 'Updated successfully',
            contentType: 'application/json',
            schema: `#/components/schemas/${schema.name}`
          },
          {
            id: Date.now().toString() + '_404_put',
            statusCode: '404',
            description: 'Resource not found',
            contentType: 'application/json'
          }
        ],
        security: []
      });

      // DELETE resource
      newEndpoints.push({
        id: Date.now().toString() + '_delete_' + resourceName,
        path: `/api/${resourceNamePlural}/{id}`,
        method: "DELETE",
        summary: `Delete ${resourceName}`,
        description: `Delete a ${resourceName}`,
        tags: [schema.name],
        parameters: [
          {
            id: Date.now().toString() + '_id_path_delete',
            name: 'id',
            in: 'path',
            type: 'integer',
            required: true,
            description: `${schema.name} ID`
          }
        ],
        responses: [
          {
            id: Date.now().toString() + '_204_delete',
            statusCode: '204',
            description: 'Deleted successfully',
            contentType: 'application/json'
          },
          {
            id: Date.now().toString() + '_404_delete',
            statusCode: '404',
            description: 'Resource not found',
            contentType: 'application/json'
          }
        ],
        security: []
      });
    });

    setEndpoints(prev => [...prev, ...newEndpoints]);
  };

  const loadPojoExample = (example: string) => {
    switch (example) {
      case "java-user":
        setPojoInput(`public class User {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Integer age;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private List<String> roles;
    
    // Constructors
    public User() {}
    
    public User(String firstName, String lastName, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}`);
        break;
      case "java-product":
        setPojoInput(`public class Product {
    private Long productId;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String category;
    private List<String> tags;
    private ProductStatus status;
    private LocalDateTime lastUpdated;
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
}

public enum ProductStatus {
    ACTIVE, INACTIVE, DISCONTINUED
}`);
        break;
      case "csharp-order":
        setPojoInput(`public class Order 
{
    public int OrderId { get; set; }
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public List<OrderItem> Items { get; set; }
    public Address ShippingAddress { get; set; }
}

public class OrderItem 
{
    public int ItemId { get; set; }
    public string ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class Address 
{
    public string Street { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
    public string Country { get; set; }
}`);
        break;
    }
  };

  // API Definition to Swagger conversion
  const parseApiDefinitionToSwagger = (apiDefText: string) => {
    try {
      // Parse different formats: cURL commands, HTTP requests, or structured API definitions
      const newEndpoints: ApiEndpoint[] = [];
      const newSchemas: Schema[] = [];

      // Split by different API definitions (separated by --- or new lines)
      const apiBlocks = apiDefText.split(/\n\s*---\s*\n|\n\s*##\s*/).filter(block => block.trim());

      apiBlocks.forEach((block, index) => {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return;

        let endpoint: Partial<ApiEndpoint> = {
          id: Date.now().toString() + '_api_' + index,
          parameters: [],
          responses: [],
          security: [],
          tags: ['API']
        };

        let requestBodySchema: any = null;
        let responseBodySchema: any = null;
        let currentSection = 'endpoint';

        lines.forEach(line => {
          // Parse HTTP method and path
          const httpMatch = line.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)$/i);
          if (httpMatch) {
            endpoint.method = httpMatch[1].toUpperCase();
            endpoint.path = httpMatch[2].split('?')[0]; // Remove query params from path
            endpoint.summary = `${endpoint.method} ${endpoint.path}`;
            endpoint.description = `API endpoint for ${endpoint.path}`;
            return;
          }

          // Parse summary/description
          if (line.toLowerCase().startsWith('summary:')) {
            endpoint.summary = line.substring(8).trim();
            return;
          }
          if (line.toLowerCase().startsWith('description:')) {
            endpoint.description = line.substring(12).trim();
            return;
          }

          // Parse tags
          if (line.toLowerCase().startsWith('tags:')) {
            endpoint.tags = line.substring(5).trim().split(',').map(tag => tag.trim());
            return;
          }

          // Section markers
          if (line.toLowerCase().includes('request body:') || line.toLowerCase().includes('request:')) {
            currentSection = 'request';
            return;
          }
          if (line.toLowerCase().includes('response body:') || line.toLowerCase().includes('response:')) {
            currentSection = 'response';
            return;
          }

          // Parse JSON content
          if (line.startsWith('{') && currentSection === 'request') {
            try {
              const jsonContent = extractJsonFromLines(lines, lines.indexOf(line));
              requestBodySchema = parseJsonToSchema(jsonContent, `${endpoint.path?.replace(/[^a-zA-Z0-9]/g, '')}Request`);
              if (requestBodySchema) {
                newSchemas.push(requestBodySchema);
                endpoint.requestBody = {
                  contentType: 'application/json',
                  schema: `#/components/schemas/${requestBodySchema.name}`,
                  required: true
                };
              }
            } catch (e) {
              console.warn('Failed to parse request JSON:', e);
            }
            return;
          }

          if (line.startsWith('{') && currentSection === 'response') {
            try {
              const jsonContent = extractJsonFromLines(lines, lines.indexOf(line));
              responseBodySchema = parseJsonToSchema(jsonContent, `${endpoint.path?.replace(/[^a-zA-Z0-9]/g, '')}Response`);
              if (responseBodySchema) {
                newSchemas.push(responseBodySchema);
                endpoint.responses = [
                  {
                    id: Date.now().toString() + '_200_response',
                    statusCode: '200',
                    description: 'Success',
                    contentType: 'application/json',
                    schema: `#/components/schemas/${responseBodySchema.name}`
                  }
                ];
              }
            } catch (e) {
              console.warn('Failed to parse response JSON:', e);
            }
            return;
          }

          // Parse query parameters from URL
          if (endpoint.path && endpoint.path.includes('?')) {
            const [path, queryString] = endpoint.path.split('?');
            endpoint.path = path;
            const params = new URLSearchParams(queryString);
            endpoint.parameters = Array.from(params.entries()).map(([key, value]) => ({
              id: Date.now().toString() + '_param_' + key,
              name: key,
              in: 'query' as const,
              type: 'string',
              required: false,
              description: `Query parameter ${key}`,
              example: value
            }));
          }

          // Parse path parameters
          if (endpoint.path && endpoint.path.includes('{')) {
            const pathParams = endpoint.path.match(/\{(\w+)\}/g);
            if (pathParams) {
              pathParams.forEach(param => {
                const paramName = param.slice(1, -1);
                endpoint.parameters!.push({
                  id: Date.now().toString() + '_path_' + paramName,
                  name: paramName,
                  in: 'path' as const,
                  type: 'string',
                  required: true,
                  description: `Path parameter ${paramName}`
                });
              });
            }
          }
        });

        // Add default responses if none provided
        if (!endpoint.responses || endpoint.responses.length === 0) {
          endpoint.responses = [
            {
              id: Date.now().toString() + '_default_200',
              statusCode: '200',
              description: 'Success',
              contentType: 'application/json'
            }
          ];
        }

        if (endpoint.method && endpoint.path) {
          newEndpoints.push(endpoint as ApiEndpoint);
        }
      });

      return { endpoints: newEndpoints, schemas: newSchemas };
    } catch (error) {
      throw new Error('Failed to parse API definitions');
    }
  };

  const extractJsonFromLines = (lines: string[], startIndex: number): string => {
    let jsonStr = '';
    let braceCount = 0;
    let started = false;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          started = true;
        } else if (char === '}') {
          braceCount--;
        }
        
        if (started) {
          jsonStr += char;
        }
        
        if (started && braceCount === 0) {
          return jsonStr;
        }
      }
      
      if (started) {
        jsonStr += '\n';
      }
    }
    
    return jsonStr;
  };

  const parseJsonToSchema = (jsonStr: string, schemaName: string): Schema | null => {
    try {
      const jsonObj = JSON.parse(jsonStr);
      
      const schema: Schema = {
        id: Date.now().toString() + '_schema_' + schemaName,
        name: schemaName,
        type: 'object',
        description: `Generated schema from ${schemaName}`,
        properties: [],
        required: []
      };

      const parseObject = (obj: any, parentKey = ''): SchemaProperty[] => {
        const properties: SchemaProperty[] = [];
        
        Object.entries(obj).forEach(([key, value]) => {
          const property: SchemaProperty = {
            id: Date.now().toString() + '_prop_' + key,
            name: key,
            type: typeof value === 'object' && value !== null ? 
              (Array.isArray(value) ? 'array' : 'object') : 
              typeof value as string,
            required: true,
            description: `${key} property`,
            example: Array.isArray(value) ? undefined : value
          };

          if (Array.isArray(value) && value.length > 0) {
            property.items = typeof value[0] === 'object' ? 'object' : typeof value[0];
          }

          // Set format based on value patterns
          if (typeof value === 'string') {
            if (value.includes('@')) property.format = 'email';
            else if (value.match(/^\d{4}-\d{2}-\d{2}/)) property.format = 'date-time';
            else if (value.startsWith('http')) property.format = 'uri';
          }

          properties.push(property);
        });

        return properties;
      };

      schema.properties = parseObject(jsonObj);
      schema.required = schema.properties.map(p => p.name);

      return schema;
    } catch (error) {
      return null;
    }
  };

  const generateSwaggerFromApiDefinition = () => {
    if (!apiDefinitionInput.trim()) {
      toast({
        title: "No API Definition",
        description: "Please provide API definitions",
        variant: "destructive",
      });
      return;
    }

    try {
      const { endpoints: newEndpoints, schemas: newSchemas } = parseApiDefinitionToSwagger(apiDefinitionInput);
      
      if (newEndpoints.length === 0) {
        toast({
          title: "No APIs Found",
          description: "Could not parse any API definitions from the input",
          variant: "destructive",
        });
        return;
      }

      // Add to existing endpoints and schemas
      setEndpoints(prev => [...prev, ...newEndpoints]);
      setSchemas(prev => [...prev, ...newSchemas]);
      
      toast({
        title: "APIs Generated!",
        description: `Generated ${newEndpoints.length} endpoint(s) and ${newSchemas.length} schema(s)`,
      });

      // Clear the input and generate swagger immediately
      setApiDefinitionInput('');
      setTimeout(() => generateSwaggerDoc(), 100);
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse API definitions. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const loadApiDefinitionExample = (example: string) => {
    switch (example) {
      case "rest-crud":
        setApiDefinitionInput(`## User API
GET /api/users
Summary: Get all users
Description: Retrieve a list of all users with pagination
Tags: Users

Response Body:
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "createdAt": "2023-12-01T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}

---

POST /api/users
Summary: Create new user
Description: Create a new user account
Tags: Users

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "password": "securepassword"
}

Response Body:
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "createdAt": "2023-12-01T10:00:00Z"
}

---

PUT /api/users/{id}
Summary: Update user
Description: Update an existing user
Tags: Users

Request Body:
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "age": 31
}

Response Body:
{
  "id": 123,
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "age": 31,
  "updatedAt": "2023-12-01T11:00:00Z"
}`);
        break;
      case "ecommerce":
        setApiDefinitionInput(`## Product Catalog API
GET /api/products?category=electronics&page=1&limit=20
Summary: Get products
Description: Retrieve products with filtering and pagination
Tags: Products

Response Body:
{
  "products": [
    {
      "productId": "PROD123",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones",
      "price": 99.99,
      "category": "electronics",
      "inStock": true,
      "images": ["image1.jpg", "image2.jpg"],
      "specifications": {
        "color": "Black",
        "brand": "TechBrand",
        "weight": "250g"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}

---

POST /api/orders
Summary: Create order
Description: Create a new order with items
Tags: Orders

Request Body:
{
  "customerId": "CUST456",
  "items": [
    {
      "productId": "PROD123",
      "quantity": 2,
      "unitPrice": 99.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}

Response Body:
{
  "orderId": "ORD789",
  "status": "pending",
  "totalAmount": 199.98,
  "estimatedDelivery": "2023-12-05T00:00:00Z",
  "trackingNumber": "TRK123456789"
}`);
        break;
      case "auth-api":
        setApiDefinitionInput(`## Authentication API
POST /api/auth/login
Summary: User login
Description: Authenticate user and return access token
Tags: Authentication

Request Body:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response Body:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def50200abc...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"]
  }
}

---

POST /api/auth/refresh
Summary: Refresh token
Description: Refresh access token using refresh token
Tags: Authentication

Request Body:
{
  "refreshToken": "def50200abc..."
}

Response Body:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}

---

GET /api/profile
Summary: Get user profile
Description: Get current user's profile information
Tags: Users

Response Body:
{
  "id": 123,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  },
  "subscription": {
    "plan": "premium",
    "expiresAt": "2024-12-01T00:00:00Z"
  }
}`);
        break;
    }
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="info">API Info</TabsTrigger>
              <TabsTrigger value="api-def">API Definition</TabsTrigger>
              <TabsTrigger value="pojo">POJO Import</TabsTrigger>
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

            {/* API Definition Tab */}
            <TabsContent value="api-def" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      API Definition Import
                    </span>
                    <div className="flex gap-2">
                      <Select onValueChange={loadApiDefinitionExample}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Load example" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rest-crud">REST CRUD</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="auth-api">Auth API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Define your APIs with HTTP methods, paths, request/response bodies to generate complete Swagger documentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-def-input">API Definitions</Label>
                    <Textarea
                      id="api-def-input"
                      value={apiDefinitionInput}
                      onChange={(e) => setApiDefinitionInput(e.target.value)}
                      placeholder={`Define your APIs in this format:

## API Name
GET /api/users?page=1&limit=10
Summary: Get all users
Description: Retrieve users with pagination
Tags: Users

Response Body:
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "total": 100
}

---

POST /api/users
Summary: Create user
Tags: Users

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com"
}

Response Body:
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}`}
                      rows={20}
                      className="font-mono text-sm"
                      data-testid="textarea-api-def-input"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={generateSwaggerFromApiDefinition}
                      disabled={!apiDefinitionInput.trim()}
                      className="flex-1"
                      data-testid="button-generate-from-api-def"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Swagger Documentation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setApiDefinitionInput('')}
                      data-testid="button-clear-api-def"
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Format Guidelines:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Start with HTTP method and path: <code>GET /api/users</code></li>
                      <li>Add optional summary, description, and tags</li>
                      <li>Include request/response bodies as JSON</li>
                      <li>Separate multiple APIs with <code>---</code></li>
                      <li>Query parameters in URL are auto-detected</li>
                      <li>Path parameters like <code>{`{id}`}</code> are auto-detected</li>
                      <li>JSON schemas are generated from request/response examples</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* POJO Import Tab */}
            <TabsContent value="pojo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Import POJO/Class Definitions
                    </span>
                    <div className="flex gap-2">
                      <Select onValueChange={loadPojoExample}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Load example" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="java-user">Java User</SelectItem>
                          <SelectItem value="java-product">Java Product</SelectItem>
                          <SelectItem value="csharp-order">C# Order</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Paste your POJO/class definitions below to automatically generate schemas and REST endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pojo-input">Class Definitions (Java, C#, TypeScript)</Label>
                    <Textarea
                      id="pojo-input"
                      value={pojoInput}
                      onChange={(e) => setPojoInput(e.target.value)}
                      placeholder={`Paste your class definitions here, e.g.:

public class User {
    private Long id;
    private String name;
    private String email;
    
    // getters and setters...
}

public class Product {
    private String productId;
    private String name;
    private BigDecimal price;
    
    // getters and setters...
}`}
                      rows={15}
                      className="font-mono text-sm"
                      data-testid="textarea-pojo-input"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={generateSchemasFromPojo}
                      disabled={!pojoInput.trim()}
                      className="flex-1"
                      data-testid="button-generate-from-pojo"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Generate Schemas & Endpoints
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPojoInput('')}
                      data-testid="button-clear-pojo"
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Supported Languages:</strong> Java, C#, TypeScript</p>
                    <p><strong>Supported Features:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Class and interface definitions</li>
                      <li>Private/public fields with types</li>
                      <li>Getter/setter methods</li>
                      <li>Generic types (List&lt;String&gt;, Array[])</li>
                      <li>Auto-generation of CRUD endpoints</li>
                      <li>Intelligent type mapping to OpenAPI</li>
                    </ul>
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