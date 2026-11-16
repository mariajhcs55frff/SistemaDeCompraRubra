import { useState, useMemo } from "react";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  ChevronRight,
  Search,
  Scissors,
  Package,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  stock: number;
  swatch: string;
  gradient: [string, string];
}

interface CartItem extends Product {
  quantity: number;
}

type OrderStatus = "pendente" | "confirmado" | "enviado" | "entregue";

interface Order {
  id: string;
  date: string;
  items: Array<{ name: string; quantity: number; price: number; swatch: string }>;
  total: number;
  status: OrderStatus;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  // Botões
  {
    id: 1, name: "Botão Pérola 15mm", category: "Botões",
    price: 0.90, unit: "unid.", stock: 250,
    description: "Pérola sintética com acabamento acetinado e brilho suave",
    swatch: "#F0E8DC", gradient: ["#E8D5BE", "#C4A882"],
  },
  {
    id: 2, name: "Botão Madeira Natural", category: "Botões",
    price: 1.20, unit: "unid.", stock: 180,
    description: "Madeira artesanal torneada, 2 furos, tom carvalho claro",
    swatch: "#C4956A", gradient: ["#C4956A", "#8B5E3C"],
  },
  {
    id: 3, name: "Botão Metal Dourado", category: "Botões",
    price: 2.50, unit: "unid.", stock: 120,
    description: "Liga metálica com banho dourado fosco, 20mm com pé",
    swatch: "#D4AF37", gradient: ["#D4AF37", "#9A7B1A"],
  },
  {
    id: 4, name: "Botão Forrado Vermelho", category: "Botões",
    price: 1.80, unit: "unid.", stock: 90,
    description: "Forrado em tecido satin vermelho, 20mm, acabamento fino",
    swatch: "#8B1A2E", gradient: ["#8B1A2E", "#4A0A18"],
  },
  {
    id: 5, name: "Botão Coco Natural", category: "Botões",
    price: 1.40, unit: "unid.", stock: 200,
    description: "Botão de coco genuíno, tom natural com veios únicos",
    swatch: "#6B4226", gradient: ["#6B4226", "#3D2010"],
  },
  // Zíperes
  {
    id: 6, name: "Zíper Metal Níquel 20cm", category: "Zíperes",
    price: 4.50, unit: "unid.", stock: 75,
    description: "Dentes de metal cor níquel, puxador lacrê, 20cm",
    swatch: "#9CA3AF", gradient: ["#9CA3AF", "#4B5563"],
  },
  {
    id: 7, name: "Zíper Invisível 60cm", category: "Zíperes",
    price: 3.80, unit: "unid.", stock: 100,
    description: "Zíper espiral invisível, ideal para vestidos e saias",
    swatch: "#F5EBE0", gradient: ["#DDD0C0", "#B0A090"],
  },
  {
    id: 8, name: "Zíper Nylon 50cm Preto", category: "Zíperes",
    price: 2.90, unit: "unid.", stock: 150,
    description: "Espiral nylon resistente, acabamento liso, preto absoluto",
    swatch: "#1A1A1A", gradient: ["#3D3D3D", "#1A1A1A"],
  },
  {
    id: 9, name: "Zíper Metal Ouro 30cm", category: "Zíperes",
    price: 5.80, unit: "unid.", stock: 55,
    description: "Dentes dourados, puxador vintage, destaque decorativo",
    swatch: "#C8952A", gradient: ["#C8952A", "#8A6010"],
  },
  // Fios
  {
    id: 10, name: "Linha Poliéster 500m Vermelha", category: "Fios",
    price: 6.90, unit: "bobina", stock: 200,
    description: "100% poliéster mercerizado, alta resistência, vermelho puro",
    swatch: "#C1121F", gradient: ["#C1121F", "#7A0A12"],
  },
  {
    id: 11, name: "Linha Algodão 300m Natural", category: "Fios",
    price: 8.50, unit: "bobina", stock: 160,
    description: "Algodão mercerizado tom natural cru, sem branqueamento",
    swatch: "#E8D5B0", gradient: ["#D4B896", "#A88060"],
  },
  {
    id: 12, name: "Linha Seda 150m Marfim", category: "Fios",
    price: 18.00, unit: "bobina", stock: 45,
    description: "Seda pura twist, brilho excepcional para bordados finos",
    swatch: "#F0E0C8", gradient: ["#F0E0C8", "#C8A888"],
  },
  {
    id: 13, name: "Linha Elástica 50m", category: "Fios",
    price: 5.20, unit: "rolo", stock: 80,
    description: "Fio elástico revestido para franzidos e prega decorativa",
    swatch: "#C4B8D8", gradient: ["#C4B8D8", "#8878A8"],
  },
  // Tecidos
  {
    id: 14, name: "Algodão Cru 1,40m", category: "Tecidos",
    price: 12.00, unit: "metro", stock: 30,
    description: "Algodão 100% cru, largura 1,40m, trama equilibrada",
    swatch: "#F5EBE0", gradient: ["#EAD8C0", "#C4A880"],
  },
  {
    id: 15, name: "Linho Natural 1,40m", category: "Tecidos",
    price: 28.00, unit: "metro", stock: 15,
    description: "Linho puro texturado, estruturado, ideal para peças alfaiate",
    swatch: "#C8B89A", gradient: ["#C8B89A", "#8A7A5A"],
  },
  {
    id: 16, name: "Seda Dupioni 1,10m", category: "Tecidos",
    price: 65.00, unit: "metro", stock: 8,
    description: "Seda dupioni com textura irregular e brilho iridescente",
    swatch: "#E8C8A0", gradient: ["#E8C8A0", "#B89060"],
  },
  {
    id: 17, name: "Crepe Georgette 1,40m", category: "Tecidos",
    price: 34.00, unit: "metro", stock: 12,
    description: "Tecido leve com caimento fluido, ideal para blusas e vestidos",
    swatch: "#D4C0DC", gradient: ["#D4C0DC", "#9880A8"],
  },
  // Agulhas
  {
    id: 18, name: "Agulha Universal 90/14", category: "Agulhas",
    price: 8.90, unit: "cx. 5 unid.", stock: 60,
    description: "Uso geral para tecidos de trama, agulha padrão doméstica",
    swatch: "#B0B8C8", gradient: ["#B0B8C8", "#606878"],
  },
  {
    id: 19, name: "Agulha Ballpoint 80/12", category: "Agulhas",
    price: 8.90, unit: "cx. 5 unid.", stock: 55,
    description: "Ponta arredondada para malhas, tricôs e tecidos de ponto",
    swatch: "#A0C0D8", gradient: ["#A0C0D8", "#5080A0"],
  },
  {
    id: 20, name: "Agulha Jeans 110/18", category: "Agulhas",
    price: 9.50, unit: "cx. 5 unid.", stock: 40,
    description: "Haste reforçada para denim pesado, lona e courino",
    swatch: "#5A7898", gradient: ["#5A7898", "#2A4868"],
  },
  // Elásticos
  {
    id: 21, name: "Elástico Chato Branco 2cm", category: "Elásticos",
    price: 4.20, unit: "metro", stock: 200,
    description: "Largura 2cm, alta resistência, cós de calças e saias",
    swatch: "#F5F0E8", gradient: ["#E8E0D0", "#C0B8A8"],
  },
  {
    id: 22, name: "Elástico Picot Nude 1cm", category: "Elásticos",
    price: 3.60, unit: "metro", stock: 150,
    description: "Elástico com acabamento picot delicado, lingerie e íntimos",
    swatch: "#E8C8B0", gradient: ["#E8C8B0", "#C09880"],
  },
  {
    id: 23, name: "Elástico Redondo 3mm", category: "Elásticos",
    price: 1.50, unit: "metro", stock: 250,
    description: "Fio elástico redondo fino para franzidos decorativos",
    swatch: "#D8C0E0", gradient: ["#D8C0E0", "#A880C0"],
  },
];

const CATEGORIES = ["Todos", "Botões", "Zíperes", "Fios", "Tecidos", "Agulhas", "Elásticos"];

const STATUS_CONFIG: Record<OrderStatus, { label: string; dot: string; bg: string; text: string }> = {
  pendente:   { label: "Pendente",   dot: "bg-amber-500",   bg: "bg-amber-50",  text: "text-amber-800" },
  confirmado: { label: "Confirmado", dot: "bg-blue-500",    bg: "bg-blue-50",   text: "text-blue-800"  },
  enviado:    { label: "Enviado",    dot: "bg-violet-500",  bg: "bg-violet-50", text: "text-violet-800"},
  entregue:   { label: "Entregue",   dot: "bg-emerald-500", bg: "bg-emerald-50",text: "text-emerald-800"},
};

const SAMPLE_ORDERS: Order[] = [
  {
    id: "RBR-2024-001", date: "2024-03-15", status: "entregue", total: 65.70,
    items: [
      { name: "Botão Pérola 15mm",         quantity: 50, price: 0.90, swatch: "#F0E8DC" },
      { name: "Linha Poliéster 500m",       quantity: 3,  price: 6.90, swatch: "#C1121F" },
    ],
  },
  {
    id: "RBR-2024-002", date: "2024-03-22", status: "enviado", total: 91.00,
    items: [
      { name: "Linho Natural 1,40m",        quantity: 2,  price: 28.00, swatch: "#C8B89A" },
      { name: "Zíper Invisível 60cm",       quantity: 4,  price: 3.80,  swatch: "#F5EBE0" },
      { name: "Agulha Universal 90/14",     quantity: 1,  price: 8.90,  swatch: "#B0B8C8" },
    ],
  },
  {
    id: "RBR-2024-003", date: "2024-04-01", status: "confirmado", total: 41.80,
    items: [
      { name: "Agulha Universal 90/14",     quantity: 2,  price: 8.90, swatch: "#B0B8C8" },
      { name: "Botão Madeira Natural",      quantity: 20, price: 1.20, swatch: "#C4956A" },
    ],
  },
  {
    id: "RBR-2024-004", date: "2024-04-05", status: "pendente", total: 130.00,
    items: [
      { name: "Seda Dupioni 1,10m",         quantity: 2,  price: 65.00, swatch: "#E8C8A0" },
    ],
  },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<"catalogo" | "pedidos">("catalogo");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter((p) => {
        const matchCat = selectedCategory === "Todos" || p.category === selectedCategory;
        const q = searchQuery.toLowerCase();
        const matchQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        return matchCat && matchQ;
      }),
    [selectedCategory, searchQuery]
  );

  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const changeQty = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const fmtBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-primary border-b border-primary/30">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Logotipo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <Scissors className="text-primary-foreground/50" size={16} strokeWidth={1.5} />
              <span
                className="text-primary-foreground tracking-[0.18em] text-base font-medium uppercase"
                style={{ fontFamily: "'Fraunces', serif", letterSpacing: "0.18em" }}
              >
                Rubra
              </span>
            </div>

            {/* Nav */}
            <nav className="hidden sm:flex gap-0.5">
              {(["catalogo", "pedidos"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors uppercase tracking-widest ${
                    activeTab === tab
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/8"
                  }`}
                >
                  {tab === "catalogo" ? (
                    <Package size={12} />
                  ) : (
                    <ClipboardList size={12} />
                  )}
                  {tab === "catalogo" ? "Catálogo" : "Pedidos"}
                </button>
              ))}
            </nav>
          </div>

          {/* Cart trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 text-primary-foreground text-xs font-medium rounded-sm transition-colors"
          >
            <ShoppingCart size={14} />
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-5 py-8">
        {activeTab === "catalogo" ? (
          <div className="flex gap-8">
            {/* ── Sidebar ── */}
            <aside className="w-44 shrink-0 hidden md:block">
              <p
                className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Categorias
              </p>
              <nav className="flex flex-col gap-px">
                {CATEGORIES.map((cat) => {
                  const count = cat === "Todos" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`group w-full text-left px-3 py-2 text-sm rounded-sm transition-all flex items-center justify-between ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-foreground/60 hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] tabular-nums ${
                          selectedCategory === cat ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Cart summary widget */}
              {cartCount > 0 && (
                <div className="mt-6 p-4 bg-card border border-border rounded-sm">
                  <p
                    className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    No carrinho
                  </p>
                  <p
                    className="text-xl font-medium text-foreground"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {fmtBRL(cartTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cartCount} {cartCount === 1 ? "item" : "itens"}
                  </p>
                  <button
                    onClick={() => setCartOpen(true)}
                    className="mt-3 w-full py-1.5 text-xs bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
                  >
                    Ver carrinho →
                  </button>
                </div>
              )}
            </aside>

            {/* ── Product grid ── */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1
                    className="text-2xl font-medium text-foreground"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {selectedCategory === "Todos" ? "Todos os Aviamentos" : selectedCategory}
                  </h1>
                  <p
                    className="text-xs text-muted-foreground mt-0.5"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {filteredProducts.length} produto{filteredProducts.length !== 1 && "s"}
                  </p>
                </div>

                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={13}
                  />
                  <input
                    type="text"
                    placeholder="Buscar aviamentos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-52"
                  />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                  <Search size={36} strokeWidth={1} />
                  <p className="text-sm">Nenhum produto encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map((product) => {
                    const inCart = cartItems.find((i) => i.id === product.id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        inCart={inCart}
                        onAdd={() => addToCart(product)}
                        onChangeQty={(d) => changeQty(product.id, d)}
                        fmtBRL={fmtBRL}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Orders ── */
          <OrdersView orders={SAMPLE_ORDERS} fmtBRL={fmtBRL} />
        )}
      </main>

      {/* ── Cart Drawer ── */}
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          total={cartTotal}
          onClose={() => setCartOpen(false)}
          onChangeQty={changeQty}
          fmtBRL={fmtBRL}
        />
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  inCart,
  onAdd,
  onChangeQty,
  fmtBRL,
}: {
  product: Product;
  inCart: CartItem | undefined;
  onAdd: () => void;
  onChangeQty: (d: number) => void;
  fmtBRL: (v: number) => string;
}) {
  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all duration-200">
      {/* Swatch header */}
      <div
        className="h-24 relative flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${product.gradient[0]}, ${product.gradient[1]})`,
        }}
      >
        <div
          className="w-10 h-10 rounded-full shadow-lg border-2 border-white/30"
          style={{ backgroundColor: product.swatch }}
        />
        <span
          className="absolute top-2 left-2 text-[9px] font-medium tracking-widest uppercase text-white/70 px-1.5 py-0.5 bg-black/20 rounded-sm"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {product.category}
        </span>
        {product.stock < 20 && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-medium bg-amber-500/90 text-white px-1.5 py-0.5 rounded-sm">
            <AlertTriangle size={8} />
            Últimas unid.
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground leading-snug">{product.name}</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-baseline gap-1 mt-2.5">
          <span
            className="text-base font-semibold text-primary"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {fmtBRL(product.price)}
          </span>
          <span className="text-[11px] text-muted-foreground">/{product.unit}</span>
        </div>

        <div className="mt-2.5">
          {inCart ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onChangeQty(-1)}
                className="w-7 h-7 flex items-center justify-center bg-muted hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors text-foreground"
              >
                <Minus size={11} />
              </button>
              <span
                className="flex-1 text-center text-sm font-medium text-foreground"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {inCart.quantity}
              </span>
              <button
                onClick={() => onChangeQty(1)}
                className="w-7 h-7 flex items-center justify-center bg-muted hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors text-foreground"
              >
                <Plus size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="w-full py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Adicionar
            </button>
          )}
        </div>

        <p
          className="text-[10px] text-muted-foreground mt-2"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          estoque: {product.stock} {product.unit}
        </p>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({
  items,
  total,
  onClose,
  onChangeQty,
  fmtBRL,
}: {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onChangeQty: (id: number, d: number) => void;
  fmtBRL: (v: number) => string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-sm bg-background border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2
            className="text-lg font-medium text-foreground"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Carrinho
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground px-6">
            <ShoppingCart size={40} strokeWidth={1} />
            <p className="text-sm text-center">
              Seu carrinho está vazio.
              <br />
              Explore o catálogo para adicionar aviamentos.
            </p>
            <button
              onClick={onClose}
              className="mt-2 text-xs text-primary underline underline-offset-2 hover:no-underline transition-all"
            >
              Ver catálogo →
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-card border border-border rounded-sm"
                >
                  {/* Swatch */}
                  <div
                    className="w-9 h-9 rounded-sm flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: item.swatch }}
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {fmtBRL(item.price)} / {item.unit}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() => onChangeQty(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center bg-muted hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors text-foreground"
                      >
                        <Minus size={9} />
                      </button>
                      <span
                        className="text-xs font-medium w-5 text-center text-foreground"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onChangeQty(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center bg-muted hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors text-foreground"
                      >
                        <Plus size={9} />
                      </button>
                    </div>
                  </div>
                  {/* Subtotal */}
                  <div className="text-right shrink-0 flex flex-col justify-between">
                    <p
                      className="text-xs font-medium text-foreground"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {fmtBRL(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => onChangeQty(item.id, -item.quantity)}
                      className="text-muted-foreground hover:text-destructive transition-colors mt-auto"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border bg-card/50">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-sm text-muted-foreground">Total do pedido</span>
                <span
                  className="text-2xl font-semibold text-foreground"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {fmtBRL(total)}
                </span>
              </div>
              <button className="w-full py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 active:scale-[0.99] transition-all">
                Finalizar Pedido
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Orders View ──────────────────────────────────────────────────────────────

function OrdersView({ orders, fmtBRL }: { orders: Order[]; fmtBRL: (v: number) => string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusOrder: OrderStatus[] = ["pendente", "confirmado", "enviado", "entregue"];
  const byStatus = statusOrder.reduce<Record<OrderStatus, Order[]>>(
    (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s) }),
    { pendente: [], confirmado: [], enviado: [], entregue: [] }
  );

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-medium text-foreground"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Meus Pedidos
          </h1>
          <p
            className="text-xs text-muted-foreground mt-1"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {orders.length} pedido{orders.length !== 1 && "s"} registrados
          </p>
        </div>

        {/* Status chips */}
        <div className="hidden sm:flex gap-3">
          {(statusOrder as OrderStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = byStatus[s].length;
            return (
              <div key={s} className="flex flex-col items-end">
                <span
                  className="text-lg font-semibold text-foreground"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {count}
                </span>
                <span className={`text-[10px] font-medium uppercase tracking-widest ${cfg.text}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status];
          const isOpen = expandedId === order.id;
          return (
            <div
              key={order.id}
              className="bg-card border border-border rounded-sm overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(isOpen ? null : order.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Status indicator */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wider ${cfg.text}`}
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium text-foreground"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {order.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p
                      className="text-base font-semibold text-foreground"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                </div>
              </button>

              {/* Expanded items */}
              {isOpen && (
                <div className="border-t border-border px-5 py-4 bg-background">
                  <div className="flex flex-col gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full border border-border/50 shrink-0"
                            style={{ backgroundColor: item.swatch }}
                          />
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-muted-foreground"
                          style={{ fontFamily: "'DM Mono', monospace" }}>
                          <span>{item.quantity}×</span>
                          <span className="w-20 text-right text-foreground font-medium">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                              item.price * item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-3 pt-3 border-t border-border">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground mr-4">Total</span>
                      <span
                        className="text-base font-semibold text-foreground"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
