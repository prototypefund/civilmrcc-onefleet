// import { mount } from '@vue/test-utils';
const mount = require('@vue/test-utils');
import ListView from './ListView.vue';

describe('ListView', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(ListView);
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});
