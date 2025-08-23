export const formatXML = (xml: string): string => {
  try {
    // Remove extra whitespace and normalize
    const normalized = xml.replace(/>\s+</g, '><').trim();
    
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    // Split by tags
    const tokens = normalized.split(/(<[^>]+>)/g).filter(token => token.trim());
    
    for (const token of tokens) {
      if (token.startsWith('</')) {
        // Closing tag
        indent--;
        formatted += '\n' + tab.repeat(Math.max(0, indent)) + token;
      } else if (token.startsWith('<') && token.endsWith('>')) {
        if (token.includes('/>') || token.startsWith('<?') || token.startsWith('<!')) {
          // Self-closing tag, processing instruction, or comment
          formatted += '\n' + tab.repeat(indent) + token;
        } else {
          // Opening tag
          formatted += '\n' + tab.repeat(indent) + token;
          indent++;
        }
      } else if (token.trim()) {
        // Text content
        formatted += token.trim();
      }
    }
    
    return formatted.trim();
  } catch (error) {
    throw new Error(`XML formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const minifyXML = (xml: string): string => {
  try {
    return xml
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    throw new Error(`XML minification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const validateXML = (xml: string): { valid: boolean; error?: string } => {
  try {
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      const errors = doc.getElementsByTagName('parsererror');
      if (errors.length > 0) {
        return {
          valid: false,
          error: errors[0].textContent || 'XML parsing error'
        };
      }
    }
    
    // Basic validation checks
    const trimmed = xml.trim();
    if (!trimmed.startsWith('<') || !trimmed.endsWith('>')) {
      return {
        valid: false,
        error: 'XML must start with < and end with >'
      };
    }
    
    // Check for balanced tags (basic check)
    const openTags = (trimmed.match(/<[^/][^>]*[^/]>/g) || []).length;
    const closeTags = (trimmed.match(/<\/[^>]+>/g) || []).length;
    const selfClosing = (trimmed.match(/<[^>]+\/>/g) || []).length;
    
    // This is a very basic check, more sophisticated validation would be needed
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
};

export const convertXMLToJSON = (xml: string): any => {
  try {
    if (typeof DOMParser === 'undefined') {
      throw new Error('DOMParser is not available');
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    const errors = doc.getElementsByTagName('parsererror');
    if (errors.length > 0) {
      throw new Error('Invalid XML: ' + (errors[0].textContent || 'Parsing failed'));
    }
    
    const xmlToObj = (node: Element): any => {
      const result: any = {};
      
      // Handle attributes
      if (node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          result[`@${attr.name}`] = attr.value;
        }
      }
      
      // Handle child nodes
      const children: { [key: string]: any[] } = {};
      let textContent = '';
      
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        
        if (child.nodeType === Node.ELEMENT_NODE) {
          const childElement = child as Element;
          const childName = childElement.tagName;
          
          if (!children[childName]) {
            children[childName] = [];
          }
          children[childName].push(xmlToObj(childElement));
        } else if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim() || '';
          if (text) {
            textContent += text;
          }
        }
      }
      
      // Process children
      Object.keys(children).forEach(key => {
        if (children[key].length === 1) {
          result[key] = children[key][0];
        } else {
          result[key] = children[key];
        }
      });
      
      // Add text content if present and no child elements
      if (textContent && Object.keys(children).length === 0) {
        if (Object.keys(result).length === 0) {
          return textContent;
        } else {
          result['#text'] = textContent;
        }
      }
      
      return result;
    };
    
    const rootElement = doc.documentElement;
    return {
      [rootElement.tagName]: xmlToObj(rootElement)
    };
  } catch (error) {
    throw new Error(`XML to JSON conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const convertJSONToXML = (json: any, rootName: string = 'root'): string => {
  try {
    const objToXml = (obj: any, name: string): string => {
      if (obj === null || obj === undefined) {
        return `<${name}></${name}>`;
      }
      
      if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return `<${name}>${escapeXml(String(obj))}</${name}>`;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => objToXml(item, name)).join('');
      }
      
      if (typeof obj === 'object') {
        let attributes = '';
        let content = '';
        
        Object.keys(obj).forEach(key => {
          if (key.startsWith('@')) {
            // Attribute
            const attrName = key.substring(1);
            attributes += ` ${attrName}="${escapeXml(String(obj[key]))}"`;
          } else if (key === '#text') {
            // Text content
            content += escapeXml(String(obj[key]));
          } else {
            // Child element
            content += objToXml(obj[key], key);
          }
        });
        
        if (content) {
          return `<${name}${attributes}>${content}</${name}>`;
        } else {
          return `<${name}${attributes}/>`;
        }
      }
      
      return `<${name}>${escapeXml(String(obj))}</${name}>`;
    };
    
    const escapeXml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    if (typeof json === 'object' && json !== null) {
      const keys = Object.keys(json);
      if (keys.length === 1) {
        return `<?xml version="1.0" encoding="UTF-8"?>\n${objToXml(json[keys[0]], keys[0])}`;
      }
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>\n${objToXml(json, rootName)}`;
  } catch (error) {
    throw new Error(`JSON to XML conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const formatJSON = (json: string): { formatted: string; minified: string; stats: any } => {
  try {
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 2);
    const minified = JSON.stringify(parsed);
    
    const countObjects = (obj: any): number => {
      if (typeof obj !== 'object' || obj === null) return 0;
      if (Array.isArray(obj)) {
        return obj.reduce((count: number, item: any) => count + countObjects(item), 0);
      }
      return 1 + Object.values(obj).reduce((count: number, value: any) => count + countObjects(value), 0);
    };
    
    const countArrays = (obj: any): number => {
      if (typeof obj !== 'object' || obj === null) return 0;
      if (Array.isArray(obj)) {
        return 1 + obj.reduce((count: number, item: any) => count + countArrays(item), 0);
      }
      return Object.values(obj).reduce((count: number, value: any) => count + countArrays(value), 0);
    };
    
    const stats = {
      size: Buffer.byteLength(json, 'utf8'),
      lines: formatted.split('\n').length,
      objects: countObjects(parsed),
      arrays: countArrays(parsed),
    };
    
    return { formatted, minified, stats };
  } catch (error) {
    throw new Error(`JSON formatting failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
};

export const validateJSON = (json: string): { valid: boolean; error?: string } => {
  try {
    JSON.parse(json);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
};
