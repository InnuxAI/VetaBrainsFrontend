// import React, { useMemo, useRef, useState } from "react";
// import { uploadDocument, type Domain } from "../../api/documents";
// import { UploadCloud, FileText, XCircle, CheckCircle2 } from "lucide-react";

// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";

// interface Props {
//   domains: Domain[];
//   onUploadSuccess: () => void;
// }

// const prettyBytes = (bytes?: number) => {
//   if (!bytes && bytes !== 0) return "";
//   const units = ["B", "KB", "MB", "GB", "TB"];
//   let i = 0;
//   let n = bytes;
//   while (n >= 1024 && i < units.length - 1) {
//     n /= 1024; i++;
//   }
//   return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
// };

// const UploadDocument: React.FC<Props> = ({ domains, onUploadSuccess }) => {
//   const [selectedDomain, setSelectedDomain] = useState(domains[0]?.name || "");
//   const [file, setFile] = useState<File | null>(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [dragActive, setDragActive] = useState(false);

//   const inputRef = useRef<HTMLInputElement | null>(null);

//   const domainLabel = useMemo(() => {
//     const d = domains.find((x) => x.name === selectedDomain);
//     return d?.display_name || d?.name || "Select domain";
//   }, [domains, selectedDomain]);

//   const handleFileChange = (f: File | null) => { if (f) setFile(f); };
//   const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.length) handleFileChange(e.target.files[0]);
//   };

//   const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault(); e.stopPropagation(); setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
//   };
//   const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
//   const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault(); setError(null);
//     if (!file) { setError("Please select a file"); return; }
//     if (!selectedDomain) { setError("Please select a domain"); return; }
//     setUploading(true);
//     try {
//       await uploadDocument(selectedDomain, file, title, description);
//       setFile(null); setTitle(""); setDescription(""); onUploadSuccess();
//     } catch {
//       setError("Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-6" style={{ fontFamily: "var(--font-sans)" }}>
//       <div className="max-w-5xl mx-auto space-y-4">
//         {/* Heading */}
//         <div className="space-y-1">
//           <h2 className="text-2xl font-semibold tracking-tight">Upload a document</h2>
//           <p className="text-sm text-[var(--color-muted-foreground)]">
//             Select a domain, attach a file, then add an optional title and description for better discovery.
//           </p>
//         </div>

//         <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-card)]/80 backdrop-blur-xl shadow-[0_12px_45px_-15px_var(--shadow-color)]">
//           <CardContent className="p-6 md:p-8">
//             <form onSubmit={handleSubmit} className="space-y-7" aria-labelledby="upload-doc">

//               {/* Top row: domain + title */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div className="grid gap-2">
//                   <Label htmlFor="domain">Domain</Label>
//                   <Select value={selectedDomain} onValueChange={setSelectedDomain}>
//                     <SelectTrigger
//                       id="domain"
//                       className={cn(
//                         "bg-[var(--color-input)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-ring)]",
//                         "max-w-full w-full min-w-0",
//                         // ensure text stays readable in dark
//                         "dark:text-white",
//                         // truncate very long domain names inside the trigger
//                         "[&>span]:truncate"
//                       )}
//                     >
//                       <SelectValue placeholder="Select domain">{domainLabel}</SelectValue>
//                     </SelectTrigger>
//                     <SelectContent className="bg-[var(--color-popover)] border-[var(--color-border)] dark:text-white max-h-72">
//                       {domains.map((d) => (
//                         <SelectItem key={d.id} value={d.name} className="max-w-[34rem]">
//                           <span className="block truncate">{d.display_name || d.name}</span>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="grid gap-2">
//                   <Label htmlFor="title">Title (optional)</Label>
//                   <Input
//                     id="title"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     placeholder="e.g., Q3 Sales Strategy"
//                     className="bg-[var(--color-input)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-ring)]"
//                   />
//                 </div>
//               </div>

//               {/* Dropzone */}
//               <div
//                 onDragOver={onDragOver}
//                 onDragLeave={onDragLeave}
//                 onDrop={onDrop}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
//                 className={cn(
//                   "relative rounded-2xl border-2 border-dashed transition-all p-6 md:p-7",
//                   "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
//                   dragActive
//                     ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-primary),transparent_80%)]"
//                     : "border-[var(--color-border)]/60 bg-[var(--color-background)]/40"
//                 )}
//                 aria-label="Drag and drop area"
//               >
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
//                   <div className="h-12 w-12 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center shadow">
//                     <UploadCloud className="h-6 w-6" />
//                   </div>
//                   <div className="text-sm min-w-0">
//                     <div className="font-medium">
//                       Drag & drop your file here, or
//                       <button
//                         type="button"
//                         className="ml-1 text-[var(--color-primary)] hover:underline"
//                         onClick={() => inputRef.current?.click()}
//                       >
//                         browse
//                       </button>
//                     </div>
//                     <div className="text-[var(--color-muted-foreground)]">
//                       Max size ~50MB • 1 file at a time • PDF, DOCX, PPTX, XLSX, TXT, MD
//                     </div>
//                   </div>
//                 </div>

//                 <input ref={inputRef} type="file" onChange={onInputChange} className="hidden" />

//                 {file && (
//                   <>
//                     <Separator className="my-4" />
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="flex items-center gap-3 min-w-0">
//                         <div className="h-10 w-10 rounded-md bg-[var(--color-input)] flex items-center justify-center">
//                           <FileText className="h-5 w-5 text-[var(--color-muted-foreground)]" />
//                         </div>
//                         <div className="min-w-0">
//                           <div className="text-sm font-medium truncate" title={file.name}>
//                             {file.name}
//                           </div>
//                           <div className="text-xs text-[var(--color-muted-foreground)]">{prettyBytes(file.size)}</div>
//                         </div>
//                       </div>
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         className="text-rose-500 hover:bg-rose-500/10"
//                         onClick={() => setFile(null)}
//                         title="Remove file"
//                       >
//                         <XCircle className="h-4 w-4 mr-1" />
//                         Remove
//                       </Button>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Description */}
//               <div className="grid gap-2">
//                 <Label htmlFor="description">Description (optional)</Label>
//                 <Textarea
//                   id="description"
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Short context about this document"
//                   rows={4}
//                   className="bg-[var(--color-input)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-ring)]"
//                 />
//               </div>

//               {/* Error */}
//               {error && (
//                 <Alert
//                   variant="destructive"
//                   className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
//                   role="status"
//                   aria-live="polite"
//                 >
//                 <AlertDescription className="flex items-center gap-2">
//                   <XCircle className="h-4 w-4" />
//                   {error}
//                 </AlertDescription>
//                 </Alert>
//               )}

//               {/* Actions */}
//               <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
//                 <div className="text-xs text-[var(--color-muted-foreground)]">
//                   Tip: A clear title and description improves search and recommendations.
//                 </div>
//                 <Button
//                   type="submit"
//                   disabled={uploading || !selectedDomain || !file}
//                   className={cn(
//                     "text-[var(--color-primary-foreground)]",
//                     "bg-[var(--color-primary)] hover:bg-[color-mix(in_oklch,var(--color-primary),black_10%)]",
//                     "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-0"
//                   )}
//                 >
//                   {uploading ? "Uploading…" : (
//                     <>
//                       <CheckCircle2 className="h-4 w-4 mr-1.5" />
//                       Upload
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default UploadDocument;

import React, { useMemo, useRef, useState } from "react";
import { uploadDocument, type Domain } from "../../api/documents";
import { UploadCloud, FileText, XCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  domains: Domain[];
  onUploadSuccess: () => void;
}

const prettyBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const UploadDocument: React.FC<Props> = ({ domains, onUploadSuccess }) => {
  const [selectedDomain, setSelectedDomain] = useState(domains[0]?.name || "");
  const [selectedSubdomain, setSelectedSubdomain] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const domainLabel = useMemo(() => {
    const d = domains.find((x) => x.name === selectedDomain);
    return d?.display_name || d?.name || "Select domain";
  }, [domains, selectedDomain]);

  const subdomains = useMemo(() => {
  const d = domains.find((x) => x.name === selectedDomain);
  return d?.subdomains ?? [];
}, [selectedDomain, domains]);


  const handleFileChange = (f: File | null) => {
    if (f) setFile(f);
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileChange(e.target.files[0]);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      handleFileChange(e.dataTransfer.files[0]);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please select a file");
      return;
    }
    if (!selectedDomain) {
      setError("Please select a domain");
      return;
    }
    setUploading(true);
    try {
      await uploadDocument(selectedDomain, file, title, description , selectedSubdomain || undefined);
      setFile(null);
      setTitle("");
      setDescription("");
      onUploadSuccess();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full min-h-[66vh] flex justify-center items-start py-8 px-1 sm:px-4">
      <div className="w-full max-w-screen-lg rounded-2xl bg-[var(--color-card)]/95 border border-[var(--color-border)] shadow-2xl px-4 py-10 md:p-12 mx-auto">
        {/* Heading */}
        <div className="mb-6 flex flex-col items-center">
          <h2 className="font-extrabold text-2xl md:text-3xl text-center tracking-tight">
            Upload a Document
          </h2>
          <div className="text-base md:text-lg text-[var(--color-muted-foreground)] font-normal mb-2 text-center max-w-xl">
            Upload a file to any domain. Titles and descriptions help your team instantly discover and reuse important knowledge.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" aria-labelledby="upload-doc">
          {/* Top row: domain + title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger
                  id="domain"
                  className={cn(
                    "bg-[var(--color-input)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-ring)]",
                    "max-w-full w-full min-w-0 dark:text-white [&>span]:truncate"
                  )}
                >
                  <SelectValue placeholder="Select domain">{domainLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-popover)] border-[var(--color-border)] dark:text-white max-h-72">
                  {domains.map((d) => (
                    <SelectItem key={d.id} value={d.name} className="max-w-[34rem]">
                      <span className="block truncate">
                        {d.display_name || d.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q3 Sales Strategy"
                className="bg-[var(--color-input)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-ring)]"
              />
            </div>
          </div>
          
          {(subdomains?.length ?? 0) > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="grid gap-2">
      <Label htmlFor="subdomain">Subdomain (optional)</Label>
      <Select
        value={selectedSubdomain}
        onValueChange={setSelectedSubdomain}
      >
        <SelectTrigger
          id="subdomain"
          className={cn(
            "bg-[var(--color-input)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-ring)]",
            "max-w-full w-full min-w-0 dark:text-white [&>span]:truncate"
          )}
        >
          <SelectValue placeholder="Select subdomain" />
        </SelectTrigger>
        <SelectContent className="bg-[var(--color-popover)] border-[var(--color-border)] dark:text-white max-h-72">
          {subdomains.map((s) => (
            <SelectItem key={s} value={s} className="max-w-[34rem]">
              <span className="block truncate">{s}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)}
          {/* Dropzone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={cn(
              "cursor-pointer relative rounded-2xl border-2 border-dashed p-10 transition-all shadow-inner flex flex-col items-center text-center",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
              dragActive
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 animate-pulse"
                : "border-[var(--color-border)]/70 bg-[var(--color-background)]/60"
            )}
            aria-label="Drag and drop area"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center shadow">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="text-base font-medium">
                Drag & drop your file here,
                <button
                  type="button"
                  className="ml-1 text-[var(--color-primary)] underline underline-offset-2 font-semibold"
                  onClick={() => inputRef.current?.click()}
                >
                  browse
                </button>
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)] font-normal mt-1">
                Max 50MB • Supported: PDF, DOCX, PPTX, XLSX, TXT, MD, MP4
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              onChange={onInputChange}
              className="hidden"
            />

            {file && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-md bg-[var(--color-input)] flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[var(--color-muted-foreground)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">
                        {prettyBytes(file.size)}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-500 hover:bg-rose-500/10"
                    onClick={() => setFile(null)}
                    title="Remove file"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short context about this document"
              rows={4}
              className="bg-[var(--color-input)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-ring)]"
            />
          </div>

          {/* Error */}
          {error && (
            <Alert
              variant="destructive"
              className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
              role="status"
              aria-live="polite"
            >
              <AlertDescription className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4">
            <div className="text-xs text-[var(--color-muted-foreground)]">
              Tip: A clear title & description improves discovery for your team.
            </div>
            <Button
              type="submit"
              disabled={uploading || !selectedDomain || !file}
              className={cn(
                "text-[var(--color-primary-foreground)] font-semibold px-7 py-2 text-base shadow-md rounded-lg",
                "bg-[var(--color-primary)] hover:bg-[color-mix(in_oklch,var(--color-primary),black_10%)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-0"
              )}
            >
              {uploading ? "Uploading…" : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
