"use client";

import { useState, useEffect } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Charger les notes depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  // Sauvegarder automatiquement dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  function addNote() {
    if (!title.trim()) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date().toLocaleDateString("fr-CA"),
    };
    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
  }

  function deleteNote(id: string) {
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📝 Mes notes</h1>

      <div className="flex gap-6">
        {/* Colonne gauche : formulaire + liste */}
        <div className="w-1/3 flex flex-col gap-4">
          {/* Formulaire nouvelle note */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Contenu (optionnel)"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={addNote}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg py-2 transition-colors"
            >
              Ajouter
            </button>
          </div>

          {/* Liste des notes */}
          <div className="flex flex-col gap-2">
            {notes.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Aucune note pour l&apos;instant.
              </p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`bg-white rounded-xl shadow px-4 py-3 cursor-pointer hover:shadow-md transition-shadow border-2 ${
                  selectedNote?.id === note.id
                    ? "border-blue-400"
                    : "border-transparent"
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {note.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="text-gray-300 hover:text-red-400 text-xs ml-2 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-1">{note.createdAt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite : détail de la note */}
        <div className="flex-1 bg-white rounded-xl shadow p-6">
          {selectedNote ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {selectedNote.title}
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                {selectedNote.createdAt}
              </p>
              <p className="text-gray-600 whitespace-pre-wrap">
                {selectedNote.content || (
                  <span className="italic text-gray-300">Pas de contenu.</span>
                )}
              </p>
            </>
          ) : (
            <p className="text-gray-300 italic text-sm">
              Sélectionne une note pour la lire.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
