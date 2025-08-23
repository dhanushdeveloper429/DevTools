import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Download, RefreshCw, Users, User, FileJson, FileSpreadsheet, Globe, Calendar, Mail, Phone, MapPin, Building, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  company: string;
  jobTitle: string;
  avatar: string;
  gender: string;
  nationality: string;
}

const RandomUserGenerator = () => {
  const [generatedUsers, setGeneratedUsers] = useState<UserData[]>([]);
  const [userCount, setUserCount] = useState(1);
  const [selectedLocale, setSelectedLocale] = useState("us");
  const [includeFields, setIncludeFields] = useState({
    id: true,
    name: true,
    username: true,
    email: true,
    phone: true,
    dateOfBirth: true,
    address: true,
    company: true,
    avatar: true,
    gender: true,
    nationality: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const locales = [
    { value: "us", label: "United States", flag: "🇺🇸" },
    { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
    { value: "ca", label: "Canada", flag: "🇨🇦" },
    { value: "au", label: "Australia", flag: "🇦🇺" },
    { value: "de", label: "Germany", flag: "🇩🇪" },
    { value: "fr", label: "France", flag: "🇫🇷" },
    { value: "es", label: "Spain", flag: "🇪🇸" },
    { value: "it", label: "Italy", flag: "🇮🇹" },
    { value: "jp", label: "Japan", flag: "🇯🇵" },
    { value: "br", label: "Brazil", flag: "🇧🇷" },
  ];

  const firstNames = {
    us: ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen"],
    uk: ["Oliver", "Olivia", "George", "Emma", "Harry", "Charlotte", "Jack", "Amelia", "Jacob", "Ava", "Charlie", "Isla", "Thomas", "Sophia", "Oscar", "Emily", "William", "Isabella", "James", "Mia"],
    de: ["Ben", "Emma", "Paul", "Hanna", "Leon", "Mia", "Finn", "Sofia", "Jonas", "Lina", "Luis", "Ella", "Luca", "Clara", "Felix", "Lea", "Maximilian", "Marie", "Henry", "Anna"],
    fr: ["Gabriel", "Emma", "Raphaël", "Jade", "Arthur", "Louise", "Louis", "Alice", "Lucas", "Chloé", "Adam", "Lina", "Hugo", "Rose", "Jules", "Anna", "Maël", "Inès", "Noah", "Zoé"],
    jp: ["Hiroshi", "Akiko", "Takeshi", "Yuki", "Kenji", "Naomi", "Satoshi", "Emi", "Kazuki", "Rei", "Daisuke", "Saki", "Ryuji", "Miki", "Shinji", "Nana", "Tomoya", "Yui", "Masaki", "Aoi"]
  };

  const lastNames = {
    us: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"],
    uk: ["Smith", "Jones", "Taylor", "Williams", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Roberts", "Johnson", "Lewis", "Walker", "Robinson", "Wood", "Thompson", "White", "Watson", "Jackson", "Wright"],
    de: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann"],
    fr: ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard"],
    jp: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Saito", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu"]
  };

  const companies = ["TechCorp", "InnovateLabs", "DataDyne", "CloudTech", "NextGen Solutions", "Digital Dynamics", "FutureSoft", "CyberSpace Inc", "TechNova", "ByteWorks", "CodeCraft", "DevTech", "SystemForge", "WebWorks", "AppVantage"];
  
  const jobTitles = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "DevOps Engineer", "Marketing Manager", "Sales Representative", "HR Specialist", "Financial Analyst", "Project Manager", "Quality Assurance", "Business Analyst", "Technical Writer", "Customer Success", "Operations Manager"];

  const cities = {
    us: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
    uk: ["London", "Birmingham", "Liverpool", "Sheffield", "Bristol", "Glasgow", "Leicester", "Edinburgh", "Leeds", "Cardiff"],
    de: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"],
    fr: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
    jp: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Saitama"]
  };

  const states = {
    us: ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI", "AZ", "WA", "MA", "TN", "IN", "MO", "MD", "WI", "CO", "MN"],
    uk: ["England", "Scotland", "Wales", "Northern Ireland"],
    de: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Lower Saxony", "Hesse", "Saxony", "Rhineland-Palatinate", "Berlin", "Schleswig-Holstein", "Brandenburg"],
    fr: ["Île-de-France", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie", "Hauts-de-France", "Grand Est", "Provence-Alpes-Côte d'Azur", "Normandy", "Pays de la Loire", "Brittany"],
    jp: ["Tokyo", "Kanagawa", "Osaka", "Aichi", "Saitama", "Chiba", "Hyogo", "Hokkaido", "Fukuoka", "Shizuoka"]
  };

  const getRandomItem = (array: any[]) => array[Math.floor(Math.random() * array.length)];
  
  const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const generateUser = (): UserData => {
    const localeNames = firstNames[selectedLocale as keyof typeof firstNames] || firstNames.us;
    const localeLastNames = lastNames[selectedLocale as keyof typeof lastNames] || lastNames.us;
    const localeCities = cities[selectedLocale as keyof typeof cities] || cities.us;
    const localeStates = states[selectedLocale as keyof typeof states] || states.us;
    
    const firstName = getRandomItem(localeNames);
    const lastName = getRandomItem(localeLastNames);
    const fullName = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999) + 1}`;
    const email = `${username}@${getRandomItem(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'])}`;
    
    const birthDate = getRandomDate(new Date(1960, 0, 1), new Date(2005, 11, 31));
    const age = calculateAge(birthDate);
    
    const street = `${Math.floor(Math.random() * 9999) + 1} ${getRandomItem(['Main St', 'Oak Ave', 'First St', 'Second St', 'Park Rd', 'Church St', 'Elm St', 'Washington Ave', 'Maple Dr', 'Cedar Ln'])}`;
    const city = getRandomItem(localeCities);
    const state = getRandomItem(localeStates);
    const zipCode = selectedLocale === 'us' ? 
      `${Math.floor(Math.random() * 90000) + 10000}` : 
      `${Math.floor(Math.random() * 90000) + 10000}`;
    
    const selectedLocaleObj = locales.find(l => l.value === selectedLocale);
    const country = selectedLocaleObj?.label || "United States";
    
    const phone = selectedLocale === 'us' ? 
      `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` :
      `+${Math.floor(Math.random() * 99) + 1} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`;
    
    return {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      firstName,
      lastName,
      fullName,
      username,
      email,
      phone,
      dateOfBirth: birthDate.toISOString().split('T')[0],
      age,
      address: {
        street,
        city,
        state,
        zipCode,
        country,
      },
      company: getRandomItem(companies),
      jobTitle: getRandomItem(jobTitles),
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      gender: getRandomItem(['Male', 'Female', 'Other']),
      nationality: country,
    };
  };

  const generateUsers = async () => {
    setIsGenerating(true);
    try {
      const users: UserData[] = [];
      for (let i = 0; i < userCount; i++) {
        users.push(generateUser());
      }
      setGeneratedUsers(users);
      toast({
        title: "Users Generated!",
        description: `Successfully generated ${userCount} user${userCount > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate users",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (data: string, label: string) => {
    try {
      await navigator.clipboard.writeText(data);
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

  const exportData = (format: 'json' | 'csv') => {
    if (generatedUsers.length === 0) {
      toast({
        title: "No Data",
        description: "Please generate some users first",
        variant: "destructive",
      });
      return;
    }

    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(generatedUsers, null, 2);
      filename = 'random-users.json';
    } else {
      // CSV export
      const headers = ['ID', 'First Name', 'Last Name', 'Username', 'Email', 'Phone', 'Date of Birth', 'Age', 'Street', 'City', 'State', 'Zip Code', 'Country', 'Company', 'Job Title', 'Gender', 'Nationality'];
      const csvRows = [headers.join(',')];
      
      generatedUsers.forEach(user => {
        const row = [
          user.id,
          user.firstName,
          user.lastName,
          user.username,
          user.email,
          user.phone,
          user.dateOfBirth,
          user.age.toString(),
          `"${user.address.street}"`,
          user.address.city,
          user.address.state,
          user.address.zipCode,
          user.address.country,
          user.company,
          user.jobTitle,
          user.gender,
          user.nationality
        ];
        csvRows.push(row.join(','));
      });
      
      content = csvRows.join('\n');
      filename = 'random-users.csv';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
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
      description: `Users exported as ${format.toUpperCase()}`,
    });
  };

  const filteredUsers = generatedUsers.map(user => {
    const filtered: any = {};
    
    if (includeFields.id) filtered.id = user.id;
    if (includeFields.name) {
      filtered.firstName = user.firstName;
      filtered.lastName = user.lastName;
      filtered.fullName = user.fullName;
    }
    if (includeFields.username) filtered.username = user.username;
    if (includeFields.email) filtered.email = user.email;
    if (includeFields.phone) filtered.phone = user.phone;
    if (includeFields.dateOfBirth) {
      filtered.dateOfBirth = user.dateOfBirth;
      filtered.age = user.age;
    }
    if (includeFields.address) filtered.address = user.address;
    if (includeFields.company) {
      filtered.company = user.company;
      filtered.jobTitle = user.jobTitle;
    }
    if (includeFields.avatar) filtered.avatar = user.avatar;
    if (includeFields.gender) filtered.gender = user.gender;
    if (includeFields.nationality) filtered.nationality = user.nationality;
    
    return filtered;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Random User Data Generator
          </CardTitle>
          <CardDescription>
            Generate realistic fake user data for testing, development, and prototyping
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="user-count">Number of Users</Label>
              <Input
                id="user-count"
                type="number"
                min="1"
                max="1000"
                value={userCount}
                onChange={(e) => setUserCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                data-testid="input-user-count"
              />
            </div>

            <div>
              <Label htmlFor="locale">Locale/Region</Label>
              <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                <SelectTrigger data-testid="select-locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((locale) => (
                    <SelectItem key={locale.value} value={locale.value}>
                      {locale.flag} {locale.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Include Fields</Label>
              <div className="space-y-2 mt-2">
                {Object.entries(includeFields).map(([field, checked]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={checked}
                      onCheckedChange={(checked) =>
                        setIncludeFields(prev => ({ ...prev, [field]: checked as boolean }))
                      }
                      data-testid={`checkbox-${field}`}
                    />
                    <Label htmlFor={field} className="text-sm capitalize">
                      {field === 'dateOfBirth' ? 'Date of Birth & Age' : field.replace(/([A-Z])/g, ' $1')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <Button
              onClick={generateUsers}
              disabled={isGenerating}
              className="w-full"
              data-testid="button-generate"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Generate Users
                </>
              )}
            </Button>

            {generatedUsers.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportData('json')}
                  className="flex-1"
                  data-testid="button-export-json"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportData('csv')}
                  className="flex-1"
                  data-testid="button-export-csv"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Users ({generatedUsers.length})</span>
              {generatedUsers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(filteredUsers, null, 2), "User data")}
                  data-testid="button-copy-all"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users generated yet</p>
                <p className="text-sm">Configure your settings and click "Generate Users" to get started</p>
              </div>
            ) : (
              <Tabs defaultValue="cards" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="cards">Card View</TabsTrigger>
                  <TabsTrigger value="json">JSON View</TabsTrigger>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>

                <TabsContent value="cards" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {generatedUsers.map((user, index) => (
                      <Card key={user.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {includeFields.avatar && (
                              <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-12 h-12 rounded-full"
                              />
                            )}
                            <div className="flex-1">
                              {includeFields.name && (
                                <h4 className="font-medium">{user.fullName}</h4>
                              )}
                              {includeFields.email && (
                                <p className="text-sm text-gray-600">{user.email}</p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(JSON.stringify(filteredUsers[index], null, 2), "User data")}
                              data-testid={`button-copy-user-${index}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            {includeFields.username && (
                              <div className="flex items-center gap-2">
                                <Hash className="h-3 w-3" />
                                <span>{user.username}</span>
                              </div>
                            )}
                            {includeFields.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            {includeFields.dateOfBirth && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{user.dateOfBirth} (Age: {user.age})</span>
                              </div>
                            )}
                            {includeFields.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>{user.address.city}, {user.address.state}</span>
                              </div>
                            )}
                            {includeFields.company && (
                              <div className="flex items-center gap-2">
                                <Building className="h-3 w-3" />
                                <span>{user.jobTitle} at {user.company}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="json">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm">
                      <code>{JSON.stringify(filteredUsers, null, 2)}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="table">
                  <div className="border rounded-lg overflow-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {includeFields.name && <th className="p-2 text-left">Name</th>}
                          {includeFields.email && <th className="p-2 text-left">Email</th>}
                          {includeFields.phone && <th className="p-2 text-left">Phone</th>}
                          {includeFields.company && <th className="p-2 text-left">Company</th>}
                          {includeFields.address && <th className="p-2 text-left">Location</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {generatedUsers.map((user) => (
                          <tr key={user.id} className="border-t">
                            {includeFields.name && <td className="p-2">{user.fullName}</td>}
                            {includeFields.email && <td className="p-2">{user.email}</td>}
                            {includeFields.phone && <td className="p-2">{user.phone}</td>}
                            {includeFields.company && <td className="p-2">{user.company}</td>}
                            {includeFields.address && <td className="p-2">{user.address.city}, {user.address.state}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RandomUserGenerator;