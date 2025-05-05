// types.d.ts
import { ParamListBase } from '@react-navigation/native';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends ParamListBase {
      form: undefined;
    }
  }
}

declare module '@react-navigation/native' {
  export type NativeStackNavigationOptions = {
    id?: string;
  }
}