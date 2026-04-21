"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else if (data) {
        setNotes(data);
      }

      setLoading(false);
    };

    void bootstrap();
  }, [router]);

  async function addNote() {
    if (!title.trim() || !userId) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
      })
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotes((prev) => (data ? [data, ...prev] : prev));
    setTitle("");
    setContent("");
    setMessage("");
  }

  async function deleteNote(id: string) {
    if (!userId) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
    setMessage("");
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Mes notes</h1>
        <button
          onClick={() => void signOut()}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Deconnexion
        </button>
      </div>

      {message ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {message}
        </p>
      ) : null}

      <div className="flex gap-6">
        <div className="flex w-1/3 flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow">
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Contenu (optionnel)"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={() => void addNote()}
              className="rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              Ajouter
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {notes.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">
                Aucune note pour l&apos;instant.
              </p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`cursor-pointer rounded-xl border-2 bg-white px-4 py-3 shadow transition-shadow hover:shadow-md ${
                  selectedNote?.id === note.id
                    ? "border-blue-400"
                    : "border-transparent"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {note.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteNote(note.id);
                    }}
                    className="ml-2 text-xs text-gray-300 transition-colors hover:text-red-400"
                  >
                    x
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleDateString("fr-CA")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-xl bg-white p-6 shadow">
          {selectedNote ? (
            <>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                {selectedNote.title}
              </h2>
              <p className="mb-4 text-xs text-gray-400">
                {new Date(selectedNote.created_at).toLocaleDateString("fr-CA")}
              </p>
              <p className="whitespace-pre-wrap text-gray-600">
                {selectedNote.content || (
                  <span className="italic text-gray-300">Pas de contenu.</span>
                )}
              </p>
            </>
          ) : (
            <p className="text-sm italic text-gray-300">
              Selectionne une note pour la lire.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
