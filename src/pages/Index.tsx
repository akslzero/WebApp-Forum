import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { postsAPI, categoriesAPI } from "@/services/api";
import Navbar from "@/components/Navbar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import CommentList from "@/components/CommentList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface Post {
  _id: string;
  content: string;
  image?: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  category?: {
    _id: string;
    name: string;
    color: string;
  };
  likes: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, [selectedCategory]);

  useEffect(() => {
    if (socket) {
      socket.on("newPost", (newPost: Post) => {
        setPosts((prev) => [newPost, ...prev]);
      });

      socket.on(
        "postLikeUpdate",
        ({ postId, likesCount }: { postId: string; likesCount: number }) => {
          setPosts((prev) =>
            prev.map((post) =>
              post._id === postId ? { ...post, likesCount } : post
            )
          );
        }
      );

      socket.on("postDeleted", (postId: string) => {
        setPosts((prev) => prev.filter((post) => post._id !== postId));
      });

      return () => {
        socket.off("newPost");
        socket.off("postLikeUpdate");
        socket.off("postDeleted");
      };
    }
  }, [socket]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await postsAPI.getAll(params);
      setPosts(response.data.posts);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-2xl py-6 space-y-6">
        {user && (
          <CreatePost
            categories={categories}
            onPostCreated={loadPosts}
            onCategoryAdded={loadCategories}
          />
        )}

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="">Semua</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat._id} value={cat._id}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={loadPosts}
                onCommentClick={() => setSelectedPost(post._id)}
              />
            ))}

            {posts.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                Belum ada post.{" "}
                {user ? "Buat post pertama!" : "Login untuk membuat post."}
              </p>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={selectedPost !== null}
        onOpenChange={() => setSelectedPost(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Komentar</DialogTitle>
          </DialogHeader>
          {selectedPost && <CommentList postId={selectedPost} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
