<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import SiteHeader from '@/components/SiteHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import CartItem from '@/components/CartItem.vue'
import CheckoutModal from '@/components/CheckoutModal.vue'
import { formatPrice, resolveAsset } from '@/utils/formatters'

const CART_STORAGE_KEY = 'cosmosvit_cart_v1'
const PROMO_CODES = {
  COSMOS10: 0.1,
  MARS20: 0.2,
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        Number.isFinite(Number(item.price)) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
  } catch {
    return []
  }
}

const products = ref([])
const isLoading = ref(true)
const loadError = ref('')

const searchQuery = ref('')
const selectedCategory = ref('Усі')
const sortBy = ref('default')

const cart = ref(loadCartFromStorage())
const cartSectionRef = ref(null)

const promoInput = ref('')
const activePromoCode = ref('')
const promoFeedback = ref({ text: '', status: '' })

const isCheckoutOpen = ref(false)

watch(
  cart,
  (updatedCart) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart))
    } catch (error) {
      console.error('Failed to persist cart:', error)
    }
  },
  { deep: true },
)

const categories = computed(() => {
  const counts = new Map()
  for (const item of products.value) {
    counts.set(item.category, (counts.get(item.category) || 0) + 1)
  }

  return [
    { name: 'Усі', count: products.value.length },
    ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
  ]
})

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const list = products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === 'Усі' || product.category === selectedCategory.value
    const matchesSearch = !query || product.name.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  if (sortBy.value === 'price-asc') {
    return [...list].sort((a, b) => a.price - b.price)
  }
  if (sortBy.value === 'price-desc') {
    return [...list].sort((a, b) => b.price - a.price)
  }

  return list
})

const cartQuantityMap = computed(() => {
  const map = new Map()
  for (const item of cart.value) {
    map.set(item.id, item.quantity)
  }
  return map
})

const cartTotalCount = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity, 0),
)

const cartSubtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
)

const discountPercent = computed(() => PROMO_CODES[activePromoCode.value] || 0)

const discountAmount = computed(() =>
  Math.round(cartSubtotal.value * discountPercent.value),
)

const finalTotal = computed(() =>
  Math.max(0, cartSubtotal.value - discountAmount.value),
)

function addToCart(product) {
  const existing = cart.value.find((item) => item.id === product.id)
  if (existing) {
    existing.quantity += 1
    return
  }

  cart.value.push({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    quantity: 1,
  })
}

function incrementCartItem(id) {
  const target = cart.value.find((item) => item.id === id)
  if (target) {
    target.quantity += 1
  }
}

function decrementCartItem(id) {
  const target = cart.value.find((item) => item.id === id)
  if (!target) return

  if (target.quantity > 1) {
    target.quantity -= 1
  } else {
    removeCartItem(id)
  }
}

function removeCartItem(id) {
  cart.value = cart.value.filter((item) => item.id !== id)
}

function resetPromo() {
  promoInput.value = ''
  activePromoCode.value = ''
  promoFeedback.value = { text: '', status: '' }
}

function clearCart() {
  cart.value = []
  resetPromo()
}

function applyPromoCode() {
  const code = promoInput.value.trim().toUpperCase()
  if (!code) {
    promoFeedback.value = {
      text: 'Введіть промокод (наприклад, COSMOS10).',
      status: 'error',
    }
    return
  }

  if (PROMO_CODES[code]) {
    activePromoCode.value = code
    const percent = Math.round(PROMO_CODES[code] * 100)
    promoFeedback.value = {
      text: `Промокод ${code} активовано: знижка ${percent}%!`,
      status: 'success',
    }
  } else {
    activePromoCode.value = ''
    promoFeedback.value = {
      text: `Промокод «${code}» не знайдено. Спробуйте COSMOS10 або MARS20.`,
      status: 'error',
    }
  }
}

function handleOrderCompleted() {
  clearCart()
}

function scrollToCart() {
  cartSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'Усі'
  sortBy.value = 'default'
}

async function loadCatalog() {
  isLoading.value = true
  loadError.value = ''

  try {
    const response = await fetch(resolveAsset('data/catalog.json'))
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    products.value = await response.json()
  } catch (error) {
    loadError.value = 'Не вдалося завантажити каталог товарів. Спробуйте оновити сторінку.'
    console.error('Catalog fetch error:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadCatalog)
</script>

<template>
  <SiteHeader
    :total-count="cartTotalCount"
    :total-price="finalTotal"
    @go-to-cart="scrollToCart"
  />

  <main class="container shop-main">
    <section class="hero-banner">
      <div class="hero-text">
        <span class="hero-kicker">Космічний каталог · Vue 3</span>
        <h1>Космічні постери, 3D-моделі та сувеніри</h1>
        <p>
          Продовження проєкту «КосмоСвіт»: обирайте постери далеких галактик, деталізовані
          3D-моделі планет і ракет та подарункові сувеніри з миттєвим оновленням кошика.
        </p>
      </div>
      <div class="hero-image">
        <img :src="resolveAsset('images/hero.jpg')" alt="Вид на нічну Землю з космосу" />
      </div>
    </section>

    <div class="shop-layout">
      <div class="catalog-column">
        <section class="controls-panel" aria-label="Пошук та фільтрація каталогу">
          <div class="controls-top">
            <div class="search-box">
              <input
                v-model.trim="searchQuery"
                type="search"
                class="search-input"
                placeholder="Пошук за назвою (наприклад: Марс, Сатурн, постер)..."
                aria-label="Пошук товару за назвою"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="search-clear-btn"
                aria-label="Очистити пошук"
                @click="searchQuery = ''"
              >
                ✕
              </button>
            </div>

            <select v-model="sortBy" class="sort-select" aria-label="Сортування за ціною">
              <option value="default">За замовчуванням</option>
              <option value="price-asc">Ціна: спочатку дешевші</option>
              <option value="price-desc">Ціна: спочатку дорожчі</option>
            </select>
          </div>

          <div class="controls-bottom">
            <div class="category-pills" role="tablist" aria-label="Фільтр за категорією">
              <button
                v-for="cat in categories"
                :key="cat.name"
                type="button"
                class="category-pill"
                :class="{ active: selectedCategory === cat.name }"
                @click="selectedCategory = cat.name"
              >
                {{ cat.name }} ({{ cat.count }})
              </button>
            </div>

            <span v-if="!isLoading && !loadError" class="results-meta">
              Знайдено: {{ filteredProducts.length }} з {{ products.length }}
            </span>
          </div>
        </section>

        <div v-if="isLoading" class="empty-state">
          <div class="empty-icon">🛰️</div>
          <h3>Завантажуємо каталог...</h3>
          <p>Отримуємо дані про космічні товари з JSON-каталогу.</p>
        </div>

        <div v-else-if="loadError" class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Помилка завантаження</h3>
          <p>{{ loadError }}</p>
          <button type="button" class="btn" @click="loadCatalog">Спробувати ще раз</button>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="empty-state">
          <div class="empty-icon">🔭</div>
          <h3>Нічого не знайдено</h3>
          <p>
            За запитом
            <strong v-if="searchQuery">«{{ searchQuery }}»</strong>
            <span v-if="searchQuery && selectedCategory !== 'Усі'"> у категорії </span>
            <strong v-if="selectedCategory !== 'Усі'">«{{ selectedCategory }}»</strong>
            товарів не знайдено. Спробуйте змінити умови пошуку.
          </p>
          <button type="button" class="btn" @click="resetFilters">Скинути фільтри</button>
        </div>

        <section v-else class="catalog-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            :cart-quantity="cartQuantityMap.get(product.id) || 0"
            @add-to-cart="addToCart"
          />
        </section>
      </div>

      <aside id="cart-section" ref="cartSectionRef" class="cart-panel" aria-label="Кошик">
        <div class="cart-header">
          <h2>🛒 Кошик ({{ cartTotalCount }})</h2>
          <button
            v-if="cart.length > 0"
            type="button"
            class="cart-clear-link"
            @click="clearCart"
          >
            Очистити все
          </button>
        </div>

        <div v-if="cart.length === 0" class="empty-state cart-empty">
          <div class="empty-icon">🛸</div>
          <h3>Кошик порожній</h3>
          <p>Оберіть постери, 3D-моделі чи сувеніри з каталогу ліворуч.</p>
        </div>

        <template v-else>
          <div class="cart-items-list">
            <CartItem
              v-for="item in cart"
              :key="item.id"
              :item="item"
              @increment="incrementCartItem"
              @decrement="decrementCartItem"
              @remove="removeCartItem"
            />
          </div>

          <form class="promo-box" @submit.prevent="applyPromoCode">
            <label for="promo-code-input" class="promo-label">Промокод на знижку</label>
            <div class="promo-row">
              <input
                id="promo-code-input"
                v-model="promoInput"
                type="text"
                class="promo-input"
                placeholder="Наприклад: COSMOS10"
              />
              <button type="submit" class="btn btn-secondary">Застосувати</button>
            </div>
            <p class="promo-hint">
              Діючі коди: <strong>COSMOS10</strong> (−10%), <strong>MARS20</strong> (−20%)
            </p>
            <div
              v-if="promoFeedback.text"
              class="promo-feedback"
              :class="promoFeedback.status"
            >
              {{ promoFeedback.text }}
              <button
                v-if="activePromoCode"
                type="button"
                class="cart-clear-link"
                style="margin-left: 8px; color: inherit;"
                @click="resetPromo"
              >
                Скинути
              </button>
            </div>
          </form>

          <div class="cart-summary">
            <div class="summary-row">
              <span>Товарів ({{ cartTotalCount }} шт.):</span>
              <span>{{ formatPrice(cartSubtotal) }}</span>
            </div>
            <div v-if="discountAmount > 0" class="summary-row discount">
              <span>Знижка ({{ activePromoCode }}):</span>
              <span>−{{ formatPrice(discountAmount) }}</span>
            </div>
            <div class="summary-row total">
              <span>Разом до сплати:</span>
              <span>{{ formatPrice(finalTotal) }}</span>
            </div>
          </div>

          <button
            type="button"
            class="btn btn-block"
            @click="isCheckoutOpen = true"
          >
            Оформити замовлення →
          </button>
        </template>
      </aside>
    </div>
  </main>

  <CheckoutModal
    :is-open="isCheckoutOpen"
    :total-count="cartTotalCount"
    :subtotal="cartSubtotal"
    :discount-amount="discountAmount"
    :final-total="finalTotal"
    :promo-code="activePromoCode"
    @close="isCheckoutOpen = false"
    @order-completed="handleOrderCompleted"
  />

  <footer>
    <div class="container">
      <p>© 2026 КосмоСвіт Store. Комп'ютерний практикум № 2 (Vue 3 + Vite).</p>
    </div>
  </footer>
</template>
