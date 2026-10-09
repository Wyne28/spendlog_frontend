import "./Expenses.css";
import { useState } from "react";
import AddExpenseModal from "../components/AddExpenseModel.jsx";

const EMPTY_CATEGORIES = [];

function formatAmount(satang) {
  if (!Number.isSafeInteger(satang)) {
    return "— THB";
  }

  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(satang / 100)} THB`;
}

export default function Expenses({
  categories = EMPTY_CATEGORIES,
  wallets = [],
  isLoading = false,
  error = "",
  busyCategoryId = null,
  onAddCategory,  
  onSaveExpense,
  onDeleteCategory,
  onOpenCategory,
}) {

  const [selectedCategory, setSelectedCategory] = useState(null);
  return (
    <main className="expenses-page" aria-busy={isLoading}>
      <header className="expenses-heading">
        <div>
          <h1>Categories</h1>
          <p className="expenses-description">
            Organize your expenses and payment receipts.
          </p>
        </div>

        <button
          className="expense-action"
          type="button"
          onClick={onAddCategory}
          disabled={isLoading || !onAddCategory}
        >
          Add Category
        </button>
      </header>

      <p className="category-period">
        Totals: all recorded expenses
      </p>

      {error && (
        <p className="expenses-error" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="expenses-empty" role="status">
          Loading categories…
        </p>
      ) : error ? (
        <p className="expenses-empty">
          Categories could not be loaded.
        </p>
      ) : categories.length === 0 ? (
        <div className="expenses-empty">
          <h2>No categories yet</h2>
          <p>Add a category to start organizing your expenses.</p>
        </div>
      ) : (
        <ul className="category-list">
          {categories.map((category) => {
            const busy = busyCategoryId === category._id;

            return (
              <li className="category-row" key={category._id}>
                <div className="category-information">
                  {onOpenCategory ? (
                    <button
                      className="category-name"
                      type="button"
                      onClick={() => onOpenCategory(category)}
                      disabled={busy}
                    >
                      {category.name}
                    </button>
                  ) : (
                    <span className="category-name">
                      {category.name}
                    </span>
                  )}

                  <span className="category-total">
                    {formatAmount(category.totalExpenseSatang)}
                  </span>
                </div>

                <div className="category-actions">
                  <button
                    className="expense-action"
                    type="button"
                    disabled={busy}
                    onClick={() => setSelectedCategory(category)}
                    aria-label={`Add expense to ${category.name}`}
                  >
                    Add Expense
                  </button>

                  <button
                    className="expense-action"
                    type="button"
                    disabled={busy || !onDeleteCategory}
                    onClick={() => onDeleteCategory(category)}
                    aria-label={`Delete category ${category.name}`}
                  >
                    <svg
                      className="delete-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18M9 6V3h6v3" />
                      <path d="m5 6 1 15h12l1-15M10 10v7M14 10v7" />
                    </svg>
                    Delete Category
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedCategory && (
        <AddExpenseModal 
          category = {selectedCategory}
          wallets = {wallets}
          onClose = {() => setSelectedCategory(null)}
          onSave = {onSaveExpense}
          />
      )}

      < button 
        type = "button"
        onClick = {() => setSelectedCategory( { _id: "", name: "Form preview"})}
        >
          Preview expense form 
        </button>
    </main>
  );
}