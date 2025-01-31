import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useCreatePost } from "@/hooks/useCreatePost";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreatePostFormProps {
  userId: string;
  profile: {
    username?: string;
    avatar_url?: string;
  };
}

export const CreatePostForm = ({ userId, profile }: CreatePostFormProps) => {
  const [newPost, setNewPost] = useState("");
  const [tags, setTags] = useState("");
  const createPost = useCreatePost();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPost.trim()) return;

    createPost.mutate(
      { content: newPost, userId, profile, tags },
      {
        onSuccess: () => {
          setNewPost("");
          setTags("");
        },
        onError: (error) => {
          console.error("Error creating post:", error);
          setError("Failed to create post. Please try again.");
        },
      }
    );
  };

  const displayName = profile?.username || "Anonymous";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-purple-600 font-medium">{firstLetter}</span>
          )}
        </div>
        <span className="text-gray-500">@{displayName}</span>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts with the community..."
          className="min-h-[100px]"
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add tags (comma-separated)..."
          className="mb-4"
        />
        <Button
          type="submit"
          disabled={!newPost.trim() || createPost.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Share
        </Button>
      </form>
    </div>
  );
};