<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { formatPrice } from '@/utils/formatters'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  finalTotal: {
    type: Number,
    required: true,
  },
  promoCode: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'order-completed'])

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  deliveryMethod: 'nova-poshta',
  address: '',
  comment: '',
})

const hasAttemptedSubmit = ref(false)
const submittedOrder = ref(null)

const requiresAddress = computed(() => form.deliveryMethod !== 'pickup')

const errors = computed(() => {
  const result = {}
  const name = form.fullName.trim()
  const email = form.email.trim()
  const phoneDigits = form.phone.replace(/\D/g, '')
  const address = form.address.trim()

  if (!name) {
    result.fullName = "Введіть ім'я та прізвище."
  } else if (name.length < 2) {
    result.fullName = "Ім'я має містити щонайменше 2 символи."
  }

  if (!email) {
    result.email = 'Введіть електронну пошту.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    result.email = 'Вкажіть коректний e-mail (наприклад, space@example.com).'
  }

  if (!form.phone.trim()) {
    result.phone = 'Введіть номер телефону.'
  } else if (phoneDigits.length < 10 || phoneDigits.length > 12) {
    result.phone = 'Номер має містити від 10 до 12 цифр (наприклад, +380 67 123 45 67).'
  }

  if (requiresAddress.value) {
    if (!address) {
      result.address = 'Вкажіть місто та номер відділення або адресу доставки.'
    } else if (address.length < 5) {
      result.address = 'Адреса надто коротка (мінімум 5 символів).'
    }
  }

  return result
})

const isFormValid = computed(() => Object.keys(errors.value).length === 0)

function visibleError(field) {
  return hasAttemptedSubmit.value ? errors.value[field] || '' : ''
}

function deliveryLabel(method) {
  if (method === 'nova-poshta') return 'Нова Пошта'
  if (method === 'ukrposhta') return 'Укрпошта'
  return 'Самовивіз (Київ, обсерваторія «КосмоСвіт»)'
}

function resetForm() {
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.deliveryMethod = 'nova-poshta'
  form.address = ''
  form.comment = ''
  hasAttemptedSubmit.value = false
}

function handleSubmit() {
  hasAttemptedSubmit.value = true
  if (!isFormValid.value) return

  const orderId = `KS-${Math.floor(1000 + Math.random() * 9000)}`
  submittedOrder.value = {
    orderId,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    delivery: deliveryLabel(form.deliveryMethod),
    totalCount: props.totalCount,
    finalTotal: props.finalTotal,
  }

  emit('order-completed')
  resetForm()
}

function handleClose() {
  submittedOrder.value = null
  hasAttemptedSubmit.value = false
  emit('close')
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      submittedOrder.value = null
      hasAttemptedSubmit.value = false
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="isOpen"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="checkout-modal-title"
    @click.self="handleClose"
  >
    <div class="modal-card">
      <div class="modal-header">
        <h2 id="checkout-modal-title">
          {{ submittedOrder ? 'Замовлення оформлено' : 'Оформлення замовлення' }}
        </h2>
        <button
          type="button"
          class="modal-close"
          aria-label="Закрити вікно"
          @click="handleClose"
        >
          ✕
        </button>
      </div>

      <div v-if="submittedOrder" class="success-message">
        <p>
          ✅ <strong>Дякуємо, {{ submittedOrder.fullName }}!</strong>
        </p>
        <p>
          Ваше замовлення <strong>#{{ submittedOrder.orderId }}</strong> ({{ submittedOrder.totalCount }} шт. на суму
          <strong>{{ formatPrice(submittedOrder.finalTotal) }}</strong>) прийнято в обробку.
        </p>
        <p>
          Спосіб отримання: {{ submittedOrder.delivery }}. Підтвердження надіслано на
          <strong>{{ submittedOrder.email }}</strong>.
        </p>
        <button type="button" class="btn btn-block" @click="handleClose">
          Повернутися до каталогу
        </button>
      </div>

      <form v-else novalidate @submit.prevent="handleSubmit">
        <div class="cart-summary" style="margin-bottom: 16px; padding-top: 0; border-top: none;">
          <div class="summary-row">
            <span>Товарів у замовленні:</span>
            <span>{{ totalCount }} шт. ({{ formatPrice(subtotal) }})</span>
          </div>
          <div v-if="discountAmount > 0" class="summary-row discount">
            <span>Знижка за промокодом {{ promoCode }}:</span>
            <span>−{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>До сплати:</span>
            <span>{{ formatPrice(finalTotal) }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="checkout-name">Ім'я та прізвище *</label>
          <input
            id="checkout-name"
            v-model="form.fullName"
            type="text"
            placeholder="Олександр Коваленко"
            :class="{ 'input-invalid': visibleError('fullName') }"
          />
          <p v-if="visibleError('fullName')" class="field-error">
            {{ visibleError('fullName') }}
          </p>
        </div>

        <div class="form-group">
          <label for="checkout-email">Електронна пошта *</label>
          <input
            id="checkout-email"
            v-model="form.email"
            type="email"
            placeholder="student@example.com"
            :class="{ 'input-invalid': visibleError('email') }"
          />
          <p v-if="visibleError('email')" class="field-error">
            {{ visibleError('email') }}
          </p>
        </div>

        <div class="form-group">
          <label for="checkout-phone">Телефон *</label>
          <input
            id="checkout-phone"
            v-model="form.phone"
            type="tel"
            placeholder="+380 67 123 45 67"
            :class="{ 'input-invalid': visibleError('phone') }"
          />
          <p v-if="visibleError('phone')" class="field-error">
            {{ visibleError('phone') }}
          </p>
        </div>

        <div class="form-group">
          <label for="checkout-delivery">Спосіб доставки</label>
          <select id="checkout-delivery" v-model="form.deliveryMethod">
            <option value="nova-poshta">Нова Пошта (відділення / поштомат)</option>
            <option value="ukrposhta">Укрпошта</option>
            <option value="pickup">Самовивіз (Київ, обсерваторія «КосмоСвіт»)</option>
          </select>
        </div>

        <div v-if="requiresAddress" class="form-group">
          <label for="checkout-address">Місто та відділення / адреса *</label>
          <input
            id="checkout-address"
            v-model="form.address"
            type="text"
            placeholder="м. Київ, відділення № 12"
            :class="{ 'input-invalid': visibleError('address') }"
          />
          <p v-if="visibleError('address')" class="field-error">
            {{ visibleError('address') }}
          </p>
        </div>

        <div class="form-group">
          <label for="checkout-comment">Коментар до замовлення</label>
          <textarea
            id="checkout-comment"
            v-model="form.comment"
            placeholder="Побажання щодо пакування або часу дзвінка..."
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn" style="flex: 2;">
            Підтвердити замовлення 🚀
          </button>
          <button type="button" class="btn btn-secondary" style="flex: 1;" @click="handleClose">
            Скасувати
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
