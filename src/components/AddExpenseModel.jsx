import { useEffect, useRef, useState } from "react";
import "./AddExpenseModal.css";

export default function AddExpenseModal({
  category,
  wallets,
  onClose,
  onSave,
}) {
  const dialogRef = useRef(null);
  const savingRef = useRef(false);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [walletId, setWalletId] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog.showModal();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!receipt) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(receipt);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [receipt]);

  function selectReceipt(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Choose a JPG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The receipt must be 5 MB or smaller.");
      return;
    }

    setError("");
    setReceipt(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (savingRef.current) return;

    // Convert decimal text to integer satang without floating-point rounding.
    const value = amount.trim();

    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      setError("Enter an amount with up to two decimal places.");
      return;
    }

    const [whole, decimal = ""] = value.split(".");
    const amountSatang =
      Number(whole) * 100 + Number(decimal.padEnd(2, "0"));

    if (!Number.isSafeInteger(amountSatang) || amountSatang <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    if (!date || !walletId) {
      setError("Select a date and wallet.");
      return;
    }

    if (!onSave) {
      setError("Saving is not connected yet.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError("");

    try {
      await onSave({
        transaction: {
          type: "expense",
          amountSatang,
          date,
          categoryId: category._id,
          walletId,
          note: note.trim(),
        },
        receipt,
      });

      onClose();
    } catch (err) {
      setError(err.message || "Could not save the expense.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="expense-modal"
      aria-labelledby="expense-modal-title"
      onCancel={(event) => {
        event.preventDefault();

        if (!savingRef.current) {
          onClose();
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <header className="expense-modal-header">
          <div>
            <h2 id="expense-modal-title">Add Expense</h2>
            <p>Record a payment under {category.name}.</p>
          </div>

          <button
            type="button"
            className="expense-modal-close"
            aria-label="Close"
            disabled={saving}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <fieldset className="expense-modal-fields" disabled={saving}>
          <label>
            Category
            <input value={category.name} readOnly />
          </label>

          <label>
            Amount (THB)
            <input
              type="text"
              inputMode="decimal"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              autoFocus
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            Wallet
            <select
              value={walletId}
              onChange={(event) => setWalletId(event.target.value)}
              required
            >
              <option value="">Select wallet</option>

              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </label>

          {wallets.length === 0 && (
            <p className="expense-modal-help">
              Create a wallet before adding an expense.
            </p>
          )}

          <label>
            Note (optional)
            <textarea
              rows={3}
              placeholder="Add a description"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <label>
            Receipt (optional)
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={selectReceipt}
            />
          </label>

          <p className="expense-modal-help">JPG or PNG, up to 5 MB.</p>

          {receipt && (
            <div className="expense-receipt-preview">
              {preview && (
                <img src={preview} alt="Selected receipt preview" />
              )}

              <span>{receipt.name}</span>

              <button
                type="button"
                onClick={() => setReceipt(null)}
              >
                Remove receipt
              </button>
            </div>
          )}
        </fieldset>

        {error && (
          <p className="expense-modal-error" role="alert">
            {error}
          </p>
        )}

        <footer className="expense-modal-footer">
          <button
            type="button"
            className="expense-cancel"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="expense-save"
            disabled={saving || wallets.length === 0 || !onSave}
          >
            {saving ? "Saving…" : "Save Expense"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}