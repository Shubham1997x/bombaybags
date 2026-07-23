"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { inputClass } from "./form-classes";
import { ProductReorderDialog } from "./product-reorder-dialog";
import { uploadImage } from "./image-upload";
import {
  adminCreateCategory,
  adminCreateCollection,
  adminCreateSubcategory,
  adminCreateTag,
  adminDeleteCategory,
  adminDeleteCollection,
  adminDeleteSubcategory,
  adminDeleteTag,
  adminRenameCategory,
  adminRenameCollection,
  adminRenameSubcategory,
  adminRenameTag,
  adminSetCollectionImage,
  type AdminTaxonomy,
} from "@/app/actions/admin";

type Kind = "collections" | "categories" | "subcategories" | "tags";

type ActionResult = { ok: true } | { ok: false; error: string };

interface Item {
  id: number;
  name: string;
  productCount: number;
}

const ERROR_COPY: Record<string, string> = {
  in_use: "It is still used by products — move them first.",
  duplicate: "That name already exists.",
};

function errorToast(error: string) {
  toast.error(ERROR_COPY[error] ?? "That did not work. Try again.");
}

function ItemList({
  items,
  countNoun,
  onAdd,
  onRename,
  onDelete,
  addPlaceholder,
  addDisabledReason,
}: {
  items: Item[];
  countNoun: string;
  onAdd: (name: string) => Promise<ActionResult>;
  onRename: (id: number, name: string) => Promise<ActionResult>;
  onDelete: (id: number) => Promise<ActionResult>;
  addPlaceholder: string;
  addDisabledReason?: string;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<ActionResult>, successMsg: string) => {
    setBusy(true);
    try {
      const res = await action();
      if (res.ok) {
        toast.success(successMsg);
        return true;
      }
      errorToast(res.error);
      return false;
    } catch {
      toast.error("That did not work. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newName.trim();
    if (name.length < 2) return;
    if (await run(() => onAdd(name), "Added.")) setNewName("");
  };

  const submitRename = async (id: number) => {
    const name = editName.trim();
    if (name.length < 2) return;
    if (await run(() => onRename(id, name), "Renamed.")) setEditingId(null);
  };

  return (
    <div>
      {addDisabledReason ? (
        <p className="rounded-lg border border-dashed border-hairline bg-white px-4 py-3 text-sm text-ink-soft">
          {addDisabledReason}
        </p>
      ) : (
        <form onSubmit={submitAdd} className="flex flex-col gap-2 sm:max-w-lg sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={addPlaceholder}
            minLength={2}
            required
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-lg bg-ultra px-5 py-2.5 text-sm font-semibold text-paper transition active:scale-[0.98] disabled:opacity-60"
          >
            Add
          </button>
        </form>
      )}
      <ul className="mt-4 divide-y divide-hairline rounded-xl border border-hairline bg-white shadow-[0_1px_3px_rgba(16,20,43,0.05)]">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
            {editingId === item.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`${inputClass} min-w-[10rem] flex-1`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submitRename(item.id);
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void submitRename(item.id)}
                  className="shrink-0 rounded-lg bg-ultra px-3 py-1.5 text-[13px] font-semibold text-paper disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="min-w-[8rem] flex-1 text-sm font-medium text-ink">{item.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-ink-soft">
                  {item.productCount} {countNoun}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditName(item.name);
                  }}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra"
                >
                  Rename
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run(() => onDelete(item.id), "Deleted.")}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-60"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-ink-soft">Nothing here yet.</li>
        )}
      </ul>
    </div>
  );
}

function CollectionList({
  collections,
  onAdd,
  onRename,
  onDelete,
  onImageChange,
}: {
  collections: AdminTaxonomy["collections"];
  onAdd: (name: string) => Promise<ActionResult>;
  onRename: (id: number, name: string) => Promise<ActionResult>;
  onDelete: (id: number) => Promise<ActionResult>;
  onImageChange: (id: number, image: string | null) => Promise<ActionResult>;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const run = async (action: () => Promise<ActionResult>, successMsg: string) => {
    setBusy(true);
    try {
      const res = await action();
      if (res.ok) {
        toast.success(successMsg);
        return true;
      }
      errorToast(res.error);
      return false;
    } catch {
      toast.error("That did not work. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newName.trim();
    if (name.length < 2) return;
    if (await run(() => onAdd(name), "Added.")) setNewName("");
  };

  const submitRename = async (id: number) => {
    const name = editName.trim();
    if (name.length < 2) return;
    if (await run(() => onRename(id, name), "Renamed.")) setEditingId(null);
  };

  const pickImage = async (id: number, file: File | undefined) => {
    if (!file) return;
    setUploadingId(id);
    try {
      const url = await uploadImage(file);
      if (!url) {
        toast.error("Could not upload the image.");
        return;
      }
      const res = await onImageChange(id, url);
      if (res.ok) toast.success("Image updated.");
      else errorToast(res.error);
    } catch {
      toast.error("Could not upload the image.");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <form onSubmit={submitAdd} className="flex flex-col gap-2 sm:max-w-lg sm:flex-row">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New collection, e.g. Football"
          minLength={2}
          required
          className={inputClass}
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-lg bg-ultra px-5 py-2.5 text-sm font-semibold text-paper transition active:scale-[0.98] disabled:opacity-60"
        >
          Add
        </button>
      </form>
      <ul className="mt-4 divide-y divide-hairline rounded-xl border border-hairline bg-white shadow-[0_1px_3px_rgba(16,20,43,0.05)]">
        {collections.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
            <div className="aspect-square w-11 shrink-0 overflow-hidden rounded-md border border-hairline bg-tint">
              {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
            </div>
            {editingId === item.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`${inputClass} min-w-[10rem] flex-1`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submitRename(item.id);
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void submitRename(item.id)}
                  className="shrink-0 rounded-lg bg-ultra px-3 py-1.5 text-[13px] font-semibold text-paper disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="min-w-[8rem] flex-1 text-sm font-medium text-ink">{item.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-ink-soft">{item.productCount} products</span>
                <label className="shrink-0 cursor-pointer rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra">
                  {uploadingId === item.id ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingId === item.id}
                    onChange={(e) => {
                      void pickImage(item.id, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditName(item.name);
                  }}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra"
                >
                  Rename
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run(() => onDelete(item.id), "Deleted.")}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-60"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
        {collections.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-ink-soft">Nothing here yet.</li>
        )}
      </ul>
    </div>
  );
}

function CategoryList({
  categories,
  collections,
  onAdd,
  onRename,
  onDelete,
  onReorder,
}: {
  categories: AdminTaxonomy["categories"];
  collections: AdminTaxonomy["collections"];
  onAdd: (name: string, collectionId: number) => Promise<ActionResult>;
  onRename: (id: number, name: string, collectionId: number) => Promise<ActionResult>;
  onDelete: (id: number) => Promise<ActionResult>;
  onReorder: (id: number, name: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [newCollectionId, setNewCollectionId] = useState<number | "">(collections[0]?.id ?? "");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCollectionId, setEditCollectionId] = useState<number | "">("");
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<ActionResult>, successMsg: string) => {
    setBusy(true);
    try {
      const res = await action();
      if (res.ok) {
        toast.success(successMsg);
        return true;
      }
      errorToast(res.error);
      return false;
    } catch {
      toast.error("That did not work. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newName.trim();
    if (name.length < 2 || newCollectionId === "") return;
    if (await run(() => onAdd(name, newCollectionId), "Added.")) setNewName("");
  };

  const submitRename = async (id: number) => {
    const name = editName.trim();
    if (name.length < 2 || editCollectionId === "") return;
    if (await run(() => onRename(id, name, editCollectionId), "Renamed.")) setEditingId(null);
  };

  return (
    <div>
      {collections.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline bg-white px-4 py-3 text-sm text-ink-soft">
          Create a collection first.
        </p>
      ) : (
        <form onSubmit={submitAdd} className="flex flex-col gap-2 sm:max-w-lg sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            minLength={2}
            required
            className={inputClass}
          />
          <select
            value={newCollectionId}
            onChange={(e) => setNewCollectionId(Number(e.target.value))}
            className={`${inputClass} sm:max-w-[10rem]`}
          >
            {collections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-lg bg-ultra px-5 py-2.5 text-sm font-semibold text-paper transition active:scale-[0.98] disabled:opacity-60"
          >
            Add
          </button>
        </form>
      )}
      <ul className="mt-4 divide-y divide-hairline rounded-xl border border-hairline bg-white shadow-[0_1px_3px_rgba(16,20,43,0.05)]">
        {categories.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
            {editingId === item.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`${inputClass} min-w-[10rem] flex-1`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submitRename(item.id);
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <select
                  value={editCollectionId}
                  onChange={(e) => setEditCollectionId(Number(e.target.value))}
                  className={`${inputClass} sm:max-w-[10rem]`}
                >
                  {collections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void submitRename(item.id)}
                  className="shrink-0 rounded-lg bg-ultra px-3 py-1.5 text-[13px] font-semibold text-paper disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="min-w-[8rem] flex-1">
                  <span className="text-sm font-medium text-ink">{item.name}</span>
                  <span className="ml-2 rounded-md bg-tint px-1.5 py-0.5 text-[11px] font-semibold text-ultra">
                    {item.collectionName}
                  </span>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-ink-soft">{item.productCount} products</span>
                <button
                  type="button"
                  onClick={() => onReorder(item.id, item.name)}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra"
                >
                  Reorder products
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditName(item.name);
                    setEditCollectionId(item.collectionId);
                  }}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-ultra hover:text-ultra"
                >
                  Rename
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run(() => onDelete(item.id), "Deleted.")}
                  className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-60"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
        {categories.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-ink-soft">Nothing here yet.</li>
        )}
      </ul>
    </div>
  );
}

export function TaxonomyManager({ initialTaxonomy }: { initialTaxonomy: AdminTaxonomy }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const taxonomy = initialTaxonomy;
  const [tab, setTab] = useState<Kind>("categories");
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [reorderCategory, setReorderCategory] = useState<{ id: number; name: string } | null>(null);

  const invalidate = () => startTransition(() => router.refresh());

  const wrap =
    <T,>(fn: (input: T) => Promise<ActionResult>) =>
    async (data: T): Promise<ActionResult> => {
      const res = await fn(data);
      if (res.ok) invalidate();
      return res;
    };

  const categories = taxonomy.categories;
  const activeCategory = categories.find((c) => c.id === subCategoryId) ?? categories[0];

  const TABS: Array<{ key: Kind; label: string }> = [
    { key: "collections", label: "Collections" },
    { key: "categories", label: "Categories" },
    { key: "subcategories", label: "Subcategories" },
    { key: "tags", label: "Tags" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors active:scale-[0.98] ${
              tab === t.key
                ? "border-ultra bg-ultra text-paper"
                : "border-hairline bg-white text-ink-soft hover:border-ultra hover:text-ultra"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "collections" && (
          <CollectionList
            collections={taxonomy.collections}
            onAdd={(name) => wrap(adminCreateCollection)({ name })}
            onRename={(id, name) => wrap(adminRenameCollection)({ id, name })}
            onDelete={(id) => wrap(adminDeleteCollection)({ id })}
            onImageChange={(id, image) => wrap(adminSetCollectionImage)({ id, image })}
          />
        )}

        {tab === "categories" && (
          <CategoryList
            categories={categories}
            collections={taxonomy.collections}
            onAdd={(name, collectionId) => wrap(adminCreateCategory)({ name, collectionId })}
            onRename={(id, name, collectionId) => wrap(adminRenameCategory)({ id, name, collectionId })}
            onDelete={(id) => wrap(adminDeleteCategory)({ id })}
            onReorder={(id, name) => setReorderCategory({ id, name })}
          />
        )}

        {tab === "subcategories" && (
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Category
            </label>
            <select
              className={`${inputClass} mb-4 max-w-xs`}
              value={activeCategory?.id ?? ""}
              onChange={(e) => setSubCategoryId(Number(e.target.value))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ItemList
              items={activeCategory?.subcategories ?? []}
              countNoun="products"
              addPlaceholder={`New subcategory under ${activeCategory?.name ?? "..."}`}
              addDisabledReason={categories.length === 0 ? "Create a category first." : undefined}
              onAdd={(name) => wrap(adminCreateSubcategory)({ name, categoryId: activeCategory?.id ?? 0 })}
              onRename={(id, name) => wrap(adminRenameSubcategory)({ id, name })}
              onDelete={(id) => wrap(adminDeleteSubcategory)({ id })}
            />
          </div>
        )}

        {tab === "tags" && (
          <ItemList
            items={taxonomy.tags}
            countNoun="products"
            addPlaceholder="New tag, e.g. Match Pro"
            onAdd={(name) => wrap(adminCreateTag)({ name })}
            onRename={(id, name) => wrap(adminRenameTag)({ id, name })}
            onDelete={(id) => wrap(adminDeleteTag)({ id })}
          />
        )}
      </div>

      <ProductReorderDialog
        categoryId={reorderCategory?.id ?? null}
        categoryName={reorderCategory?.name ?? ""}
        open={reorderCategory !== null}
        onOpenChange={(open) => {
          if (!open) setReorderCategory(null);
        }}
      />
    </div>
  );
}
