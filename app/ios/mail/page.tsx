"use client";

import { Window } from "@/components/ios/Window";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatInternalEmail, parseInternalEmail } from "@/lib/email-helper";
import { RouterOutputs, trpc } from "@/lib/trpcClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Inbox,
  Mail,
  Paperclip,
  Plus,
  RefreshCw,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

type MailItem =
  | RouterOutputs["message"]["getInbox"][number]
  | RouterOutputs["message"]["getSent"][number];

export default function MailApp() {
  const [view, setView] = useState<"inbox" | "sent" | "compose">("inbox");
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);

  const { data: inbox, refetch: refetchInbox } = trpc.message.getInbox.useQuery(
    undefined,
    {
    enabled: view === "inbox",
    }
  );
  
  const { data: sent, refetch: refetchSent } = trpc.message.getSent.useQuery(
    undefined,
    {
    enabled: view === "sent",
    }
  );

  const sendMutation = trpc.message.sendMail.useMutation({
    onSuccess: () => {
      setView("sent");
      refetchSent();
    },
  });

  const deleteMutation = trpc.message.deleteMail.useMutation({
    onSuccess: () => {
        if (view === "inbox") refetchInbox();
        if (view === "sent") refetchSent();
        setSelectedMail(null);
    },
  });

  return (
    <Window title="Exiled Mail" icon={Mail} className="h-full">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white/5 border-r border-white/10 flex flex-col p-4 gap-2">
          <Button 
            className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 mb-4"
            onClick={() => {
              setView("compose");
              setSelectedMail(null);
            }}
          >
            <Plus className="w-4 h-4" /> Nouveau message
          </Button>

          <NavButton 
            icon={Inbox} 
            label="Boîte de réception" 
            active={view === "inbox"} 
            onClick={() => {
              setView("inbox");
              setSelectedMail(null);
            }}
            count={inbox?.filter((m) => !m.isRead).length}
          />
          <NavButton 
            icon={Send} 
            label="Envoyés" 
            active={view === "sent"} 
            onClick={() => {
              setView("sent");
              setSelectedMail(null);
            }}
          />
        </div>

        {/* Mail List */}
        {view !== "compose" && (
            <div className="w-80 border-r border-white/10 flex flex-col bg-white/5">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-semibold text-white">
                {view === "inbox" ? "Réception" : "Envoyés"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  view === "inbox" ? refetchInbox() : refetchSent()
                }
              >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {(view === "inbox" ? inbox : sent)?.map((mail) => (
                        <div
                            key={mail.id}
                            onClick={() => setSelectedMail(mail)}
                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/10 transition-colors ${
                    selectedMail?.id === mail.id
                      ? "bg-blue-500/10 border-l-2 border-l-blue-500"
                      : ""
                  } ${
                    !mail.isRead && view === "inbox"
                      ? "font-semibold bg-white/5"
                      : ""
                  }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm truncate w-24">
                      {view === "inbox" && "sender" in mail
                        ? formatInternalEmail(mail.sender.username)
                        : view === "sent" && "receiver" in mail
                        ? `À: ${formatInternalEmail(mail.receiver.username)}`
                        : "Inconnu"}
                                </span>
                                <span className="text-xs text-gray-500">
                      {format(new Date(mail.createdAt), "dd/MM", {
                        locale: fr,
                      })}
                                </span>
                            </div>
                  <div className="text-white text-sm truncate">
                    {mail.subject}
                  </div>
                  <div className="text-gray-400 text-xs truncate mt-1">
                    {mail.content}
                  </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Reading Pane / Compose */}
        <div className="flex-1 flex flex-col bg-[#1c1c1c]/50">
            {view === "compose" ? (
            <ComposeForm
              onSubmit={(data) => sendMutation.mutate(data)}
              isSending={sendMutation.isPending}
              onCancel={() => setView("inbox")}
            />
            ) : selectedMail ? (
                <div className="flex flex-col h-full animate-in fade-in duration-200">
                    <div className="p-6 border-b border-white/10 flex justify-between items-start">
                        <div className="flex gap-4">
                            <Avatar>
                    <AvatarImage
                      src={
                        view === "inbox" && "sender" in selectedMail
                          ? selectedMail.sender.avatar || ""
                          : ""
                      }
                    />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div>
                    <h1 className="text-xl font-bold text-white mb-1">
                      {selectedMail.subject}
                    </h1>
                                <div className="text-sm text-gray-400">
                      De:{" "}
                      <span className="text-white">
                        {view === "inbox" && "sender" in selectedMail
                          ? formatInternalEmail(selectedMail.sender.username)
                          : "Moi"}
                      </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                      {format(
                        new Date(selectedMail.createdAt),
                        "dd MMMM yyyy à HH:mm",
                        { locale: fr }
                      )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm">
                                <Reply className="w-4 h-4 mr-2" /> Répondre
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm"
                    onClick={() =>
                      deleteMutation.mutate({ id: selectedMail.id })
                    }
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 p-8 text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {selectedMail.content}
                {selectedMail.attachment && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <a
                      href={selectedMail.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-md text-blue-400 transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                      Pièce jointe
                    </a>
                  </div>
                )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
                    <Mail className="w-16 h-16 opacity-20" />
                    <p>Sélectionnez un message pour le lire</p>
                </div>
            )}
        </div>
      </div>
    </Window>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
            </div>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem]">
          {count}
        </Badge>
            )}
        </button>
  );
}

function ComposeForm({
  onSubmit,
  isSending,
  onCancel,
}: {
  onSubmit: (data: {
    receiverUsername: string;
    subject: string;
    content: string;
    attachmentUrl?: string;
  }) => void;
  isSending: boolean;
  onCancel: () => void;
}) {
    const [receiver, setReceiver] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachment(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/mail", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const data = await response.json();
      setAttachmentUrl(data.url);
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload du fichier");
      setAttachment(null);
    } finally {
      setUploading(false);
    }
  };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    // Parser l'email si format username@exiledrpstaff.com, sinon utiliser tel quel
    const receiverUsername = parseInternalEmail(receiver) || receiver;
    onSubmit({
      receiverUsername,
      subject,
      content,
      attachmentUrl: attachmentUrl || undefined,
    });
    // Reset form
    setReceiver("");
    setSubject("");
    setContent("");
    setAttachment(null);
    setAttachmentUrl(null);
    };

    return (
        <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-4 animate-in slide-in-from-bottom-5">
            <h2 className="text-xl font-bold text-white mb-4">Nouveau Message</h2>
            <div className="space-y-4">
                <Input 
          placeholder="Destinataire (pseudo ou username@exiledrpstaff.com)"
                    className="bg-white/5 border-white/10 text-white"
                    value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
                />
                <Input 
                    placeholder="Sujet" 
                    className="bg-white/5 border-white/10 text-white"
                    value={subject}
          onChange={(e) => setSubject(e.target.value)}
                />
                <Textarea 
                    placeholder="Écrivez votre message..." 
                    className="bg-white/5 border-white/10 text-white min-h-[300px]"
                    value={content}
          onChange={(e) => setContent(e.target.value)}
                />
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading || !!attachment}
            />
            <Paperclip className="w-4 h-4" />
            {attachment ? (
              <span className="text-white">{attachment.name}</span>
            ) : (
              <span>Ajouter une pièce jointe</span>
            )}
          </label>
          {attachmentUrl && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-600/20 rounded-md text-green-400 text-sm">
              <Paperclip className="w-4 h-4" />
              <span>Fichier prêt à être envoyé</span>
              <button
                onClick={() => {
                  setAttachment(null);
                  setAttachmentUrl(null);
                }}
                className="ml-auto hover:text-green-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
                <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleSubmit}
            disabled={
              isSending || uploading || !receiver || !subject || !content
            }
                    >
            <Send className="w-4 h-4 mr-2" />{" "}
            {isSending ? "Envoi..." : "Envoyer"}
                    </Button>
                </div>
            </div>
        </div>
  );
}
