import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image, Send } from "lucide-react";
import { postsAPI, categoriesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CreatePostProps {
  categories: Category[];
  onPostCreated: () => void;
  onCategoryAdded?: () => void;
}

const CreatePost = ({
  categories,
  onPostCreated,
  onCategoryAdded,
}: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (category) formData.append("category", category);
      if (image) formData.append("image", image);

      await postsAPI.create(formData);

      toast({
        title: "Post berhasil dibuat!",
        description: "Post Anda telah dipublikasikan.",
      });

      setContent("");
      setCategory("");
      setImage(null);
      onPostCreated();
    } catch (error: any) {
      toast({
        title: "Gagal membuat post",
        description: error.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Apa yang sedang Anda pikirkan?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          className="min-h-[100px] resize-none"
        />

        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <input
              className="input input-sm rounded border px-2 py-1 text-sm"
              placeholder="Tambah kategori baru"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                if (!newCategory.trim()) return;
                try {
                  setAddingCategory(true);
                  const res = await categoriesAPI.create({
                    name: newCategory.trim(),
                  });
                  // select newly created category
                  setCategory(res.data._id);
                  setNewCategory("");
                  toast({
                    title: "Kategori dibuat",
                    description: `${res.data.name} telah ditambahkan`,
                  });
                  // notify parent to reload categories
                  if (onCategoryAdded) onCategoryAdded();
                } catch (err: any) {
                  toast({
                    title: "Gagal",
                    description:
                      err.response?.data?.message || "Terjadi kesalahan",
                    variant: "destructive",
                  });
                } finally {
                  setAddingCategory(false);
                }
              }}
              disabled={addingCategory}
            >
              {addingCategory ? "Menambah..." : "Tambah"}
            </Button>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button type="button" variant="outline" size="icon" asChild>
              <span>
                <Image className="h-4 w-4" />
              </span>
            </Button>
          </label>

          {image && (
            <span className="text-sm text-muted-foreground">{image.name}</span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {content.length}/500
          </span>
          <Button type="submit" disabled={loading || !content.trim()}>
            <Send className="mr-2 h-4 w-4" />
            Post
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePost;
