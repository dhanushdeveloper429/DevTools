import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Star, Send, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  toolId: string | null;
  rating: number;
  isPublished: string;
  createdAt: string;
}

interface CommentsProps {
  toolId?: string;
  showAllComments?: boolean;
}

const Comments = ({ toolId, showAllComments = false }: CommentsProps) => {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tools = [
    { id: "all", label: "All Tools" },
    { id: "hashing-tools", label: "Hashing Tools" },
    { id: "encryption-tools", label: "Encryption Tools" },
    { id: "encoding-tools", label: "Encoding Tools" },
    { id: "text-converters", label: "Text Converters" },
    { id: "file-converters", label: "File Converters" },
    { id: "json-generator", label: "JSON Generator" },
    { id: "qr-tools", label: "QR Tools" },
    { id: "crypto-converter", label: "Crypto Converter" },
    { id: "duplicates-identifier", label: "Duplicates Identifier" },
    { id: "base64-pdf", label: "Base64 PDF Tools" },
    { id: "file-compression", label: "File Compression" },
  ];

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["/api/comments", toolId || selectedToolFilter],
    queryFn: async () => {
      const queryParam = showAllComments 
        ? selectedToolFilter === "all" ? "" : `?toolId=${selectedToolFilter}`
        : toolId ? `?toolId=${toolId}` : "";
      
      const response = await fetch(`/api/comments${queryParam}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: {
      authorName: string;
      authorEmail?: string;
      content: string;
      toolId?: string;
      rating: number;
    }) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error("Failed to create comment");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment Posted",
        description: "Thank you for your feedback!",
      });
      // Reset form
      setAuthorName("");
      setAuthorEmail("");
      setContent("");
      setRating(5);
      // Invalidate queries to refresh comments
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authorName.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and comment.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim() || undefined,
      content: content.trim(),
      toolId: toolId || (selectedToolFilter === "all" ? undefined : selectedToolFilter),
      rating,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getToolLabel = (toolId: string | null) => {
    if (!toolId) return "General";
    const tool = tools.find(t => t.id === toolId);
    return tool ? tool.label : toolId;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {showAllComments ? "User Feedback & Comments" : "Comments & Feedback"}
          </CardTitle>
          <CardDescription>
            {showAllComments 
              ? "Share your thoughts and see what others are saying about our developer tools"
              : "Share your experience with this tool or ask questions"
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Post a Comment</CardTitle>
            <CardDescription>
              Let us know how we can improve or what you think about the tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Your name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    data-testid="input-author-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email (Optional)</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    data-testid="input-author-email"
                  />
                </div>
              </div>

              {showAllComments && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tool</label>
                  <Select value={selectedToolFilter} onValueChange={setSelectedToolFilter}>
                    <SelectTrigger data-testid="select-tool">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tools.map((tool) => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="focus:outline-none"
                      data-testid={`star-${i + 1}`}
                    >
                      <Star
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          i < rating
                            ? "fill-yellow-400 text-yellow-400 hover:fill-yellow-500"
                            : "text-gray-300 hover:text-yellow-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating} star{rating !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Comment <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Share your thoughts, suggestions, or questions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px]"
                  required
                  data-testid="textarea-comment"
                />
              </div>

              <Button
                type="submit"
                disabled={createCommentMutation.isPending || !authorName.trim() || !content.trim()}
                className="w-full"
                data-testid="button-submit-comment"
              >
                <Send className="h-4 w-4 mr-2" />
                {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Comments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Comments ({comments.length})
            </CardTitle>
            {showAllComments && (
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Tool</label>
                <Select value={selectedToolFilter} onValueChange={setSelectedToolFilter}>
                  <SelectTrigger data-testid="select-filter-tool">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tools.map((tool) => (
                      <SelectItem key={tool.id} value={tool.id}>
                        {tool.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to share your feedback!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment: Comment, index: number) => (
                  <div key={comment.id}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{comment.authorName}</h4>
                            <div className="flex items-center">
                              {renderStars(comment.rating)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(comment.createdAt)}</span>
                            {showAllComments && comment.toolId && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary" className="text-xs">
                                  {getToolLabel(comment.toolId)}
                                </Badge>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < comments.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Comments;