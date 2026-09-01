<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: [Number, String],
    default: null
  }
})

defineEmits(['update:modelValue'])

const charCount = computed(() => props.modelValue?.length || 0)
</script>

<template>
  <div class="input-wrapper">
    <div v-if="label || maxlength" class="input-header">
      <label v-if="label" class="input-label">
        {{ label }}
        <span v-if="required" class="required-star">*</span>
      </label>
      <span v-if="maxlength" class="char-counter">
        {{ charCount }}/{{ maxlength }}
      </span>
    </div>

    <div class="input-container" :class="{ 'has-error': error }">
      <input
        type="text"
        class="custom-input"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :maxlength="maxlength"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  font-family: inherit;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

.char-counter {
  font-size: 12px;
  color: #94a3b8;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.2s ease;
}

.input-container:focus-within {
  background-color: #ffffff;
  border-color: #00b574;
  box-shadow: 0 0 0 3px rgba(0, 181, 116, 0.12);
}

.input-container.has-error {
  border-color: #ef4444;
}

.custom-input {
  width: 100%;
  height: 40px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #0f172a;
}

.custom-input::placeholder {
  color: #94a3b8;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
}
</style>