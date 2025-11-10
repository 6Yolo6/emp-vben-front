import type { SetupVxeTable } from './types';

import { defineComponent, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

import { useVbenForm } from '@vben-core/form-ui';

import {
  VxeButton,
  VxeCheckbox,

  // VxeFormGather,
  // VxeForm,
  // VxeFormItem,
  VxeIcon,
  VxeInput,
  VxeLoading,
  VxeModal,
  VxeNumberInput,
  VxePager,
  // VxeList,
  // VxeModal,
  // VxeOptgroup,
  // VxeOption,
  // VxePulldown,
  // VxeRadio,
  // VxeRadioButton,
  VxeRadioGroup,
  VxeSelect,
  VxeTooltip,
  VxeUI,
  VxeUpload,
  // VxeSwitch,
  // VxeTextarea,
} from 'vxe-pc-ui';
// 导入默认的语言
import zhCN from 'vxe-pc-ui/lib/language/zh-CN';
import enUS from 'vxe-pc-ui/lib/language/en-US';
import {
  VxeColgroup,
  VxeColumn,
  VxeGrid,
  VxeTable,
  VxeToolbar,
} from 'vxe-table';

import { extendsDefaultFormatter } from './extends';

// 是否加载过
let isInit = false;

// eslint-disable-next-line import/no-mutable-exports
export let useTableForm: typeof useVbenForm;

// 部分组件，如果没注册，vxe-table 会报错，这里实际没用组件，只是为了不报错，同时可以减少打包体积
const createVirtualComponent = (name = '') => {
  return defineComponent({
    name,
  });
};

export function initVxeTable() {
  if (isInit) {
    return;
  }

  VxeUI.component(VxeTable);
  VxeUI.component(VxeColumn);
  VxeUI.component(VxeColgroup);
  VxeUI.component(VxeGrid);
  VxeUI.component(VxeToolbar);

  VxeUI.component(VxeButton);
  VxeUI.component(createVirtualComponent('VxeButtonGroup'));
  VxeUI.component(VxeCheckbox);
  VxeUI.component(createVirtualComponent('VxeCheckboxGroup'));
  VxeUI.component(createVirtualComponent('VxeForm'));
  VxeUI.component(createVirtualComponent('VxeFormGather'));
  VxeUI.component(createVirtualComponent('VxeFormItem'));
  VxeUI.component(VxeIcon);
  VxeUI.component(VxeInput);
  VxeUI.component(createVirtualComponent('VxeList'));
  VxeUI.component(VxeLoading);
  VxeUI.component(VxeModal);
  VxeUI.component(VxeNumberInput);
  VxeUI.component(createVirtualComponent('VxeOptgroup'));
  VxeUI.component(createVirtualComponent('VxeOption'));
  VxeUI.component(VxePager);
  VxeUI.component(createVirtualComponent('VxePulldown'));
  VxeUI.component(createVirtualComponent('VxeRadio'));
  VxeUI.component(createVirtualComponent('VxeRadioButton'));
  VxeUI.component(VxeRadioGroup);
  VxeUI.component(VxeSelect);
  VxeUI.component(createVirtualComponent('VxeSwitch'));
  VxeUI.component(createVirtualComponent('VxeTextarea'));
  VxeUI.component(VxeTooltip);
  VxeUI.component(VxeUpload);

  isInit = true;
}

export function setupVbenVxeTable(setupOptions: SetupVxeTable) {
  const { configVxeTable, useVbenForm } = setupOptions;

  initVxeTable();
  useTableForm = useVbenForm;

  const { isDark, locale } = usePreferences();

  const localMap: Record<string, any> = {
    'zh-CN': zhCN,
    'en-US': enUS,
  };

  // 立即设置语言包，避免 "Language not installed" 错误
  const currentLocale = locale.value || 'zh-CN';
  const currentLang = localMap[currentLocale] || zhCN;
  VxeUI.setI18n(currentLocale, currentLang);
  VxeUI.setLanguage(currentLocale);
  VxeUI.setTheme(isDark.value ? 'dark' : 'light');

  watch(
    [() => isDark.value, () => locale.value],
    ([isDarkValue, localeValue]) => {
      VxeUI.setTheme(isDarkValue ? 'dark' : 'light');
      const lang = localMap[localeValue] || zhCN;
      VxeUI.setI18n(localeValue, lang);
      VxeUI.setLanguage(localeValue);
    },
  );

  extendsDefaultFormatter(VxeUI);

  configVxeTable(VxeUI);
}
