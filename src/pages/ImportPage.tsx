import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";
import { Upload, Check, AlertCircle, ArrowRight } from "lucide-react";

type EntityType = "companies" | "contacts";

interface ColumnMapping {
  [key: string]: string;
}

export default function ImportPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [entityType, setEntityType] = useState<EntityType>("companies");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvFields, setCsvFields] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [isImporting, setIsImporting] = useState(false);

  const targetFields = entityType === "companies" 
    ? ["name", "industry", "website", "address"]
    : ["first_name", "last_name", "email", "phone", "job_title"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          setCsvFields(results.meta.fields || []);
          
          // Auto-mapping logic
          const newMapping: ColumnMapping = {};
          results.meta.fields?.forEach(field => {
            const lowerField = field.toLowerCase();
            if (targetFields.includes(lowerField)) {
              newMapping[lowerField] = field;
            } else if (lowerField === "name" && entityType === "companies") {
              newMapping["name"] = field;
            } else if (lowerField === "email" && entityType === "contacts") {
              newMapping["email"] = field;
            }
          });
          setMapping(newMapping);
        },
      });
    }
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;
    
    setIsImporting(true);
    try {
      const mappedData = csvData.map(row => {
        const newRow: any = {};
        Object.keys(mapping).forEach(targetKey => {
          const csvKey = mapping[targetKey];
          if (csvKey && csvKey !== "none") {
            newRow[targetKey] = row[csvKey];
          }
        });
        return newRow;
      });

      const { error } = await supabase.from(entityType).insert(mappedData).select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${mappedData.length} records.`,
      });
      
      // Reset state
      setFile(null);
      setCsvData([]);
      setCsvFields([]);
      setMapping({});
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const previewData = csvData.slice(0, 5);

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Import Data</h1>
        <p className="text-muted-foreground">Import your data from CSV files into the system.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Select File & Type</CardTitle>
            <CardDescription>Choose the type of data and upload your CSV file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entity-type">Import As</Label>
              <Select value={entityType} onValueChange={(value: EntityType) => setEntityType(value)}>
                <SelectTrigger id="entity-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="companies">Companies</SelectItem>
                  <SelectItem value="contacts">Contacts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-file">Select File (CSV)</Label>
              <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
            </div>
          </CardContent>
        </Card>

        {csvFields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>2. Map Columns</CardTitle>
              <CardDescription>Match CSV columns to system fields.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetFields.map(targetField => (
                <div key={targetField} className="grid grid-cols-2 items-center gap-4">
                  <Label variant="secondary">{targetField}</Label>
                  <Select 
                    value={mapping[targetField] || "none"} 
                    onValueChange={(value) => setMapping(prev => ({ ...prev, [targetField]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {csvFields.map(field => (
                        <SelectItem key={field} value={field}>{field}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Preview & Import</CardTitle>
            <CardDescription>Review the first few rows before importing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {csvFields.map(field => (
                      <TableHead key={field}>{field}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => (
                    <TableRow key={i}>
                      {csvFields.map(field => (
                        <TableCell key={field}>{row[field]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Total records to import: {csvData.length}
            </div>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import Data"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
