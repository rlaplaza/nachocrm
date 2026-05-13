import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function FilesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not authenticated");

      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("crm-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Insert into files table
      const { error: insertError } = await supabase.from("files").insert({
        file_name: file.name,
        file_type: file.type,
        storage_path: filePath,
        uploaded_by: user.id,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file.",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (file: any) => {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from("crm-files")
        .remove([file.storage_path]);
      
      if (storageError) throw storageError;

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from("files")
        .delete()
        .eq("id", file.id);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast({
        title: "File deleted",
        description: "The file has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "There was an error deleting the file.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const downloadFile = async (storagePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("crm-files")
        .download(storagePath);
      
      if (error) throw error;
      
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "There was an error downloading the file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
          <p className="text-sm text-muted-foreground mt-1">Documents, proposals, and attachments</p>
        </div>
        <div>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" />
                Upload File
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading files...
                  </div>
                </TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No files found.</p>
                  <p className="text-xs mt-1">Upload documents to link them to accounts and opportunities.</p>
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {file.file_name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {file.file_type || "Unknown"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(file.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => downloadFile(file.storage_path, file.file_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this file?")) {
                            deleteMutation.mutate(file);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
