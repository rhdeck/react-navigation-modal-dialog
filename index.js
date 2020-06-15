import React, {
  useContext,
  createContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Button } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Deferred from "es6-deferred";
const ModalStack = createStackNavigator();
const context = createContext({});
const { Provider } = context;
const ModalProvider = ({ children, ...props }) => {
  const [deferred, setDeferred] = useState(null);
  const [component, setComponent] = useState(() => ({ resolve }) => (
    <View>
      <Text>Oh noes!!!</Text>
      <Button onPress={() => resolve("hello")} title="Press me" />
    </View>
  ));
  const value = useMemo(() => {
    return { deferred, setDeferred, component, setComponent };
  }, [deferred, setDeferred, component, setComponent]);
  return (
    <Provider value={value}>
      <ModalStack.Navigator mode="modal" headerMode="none">
        <ModalStack.Screen name="_main">{() => children}</ModalStack.Screen>
        <ModalStack.Screen name="_modal" component={P} />
      </ModalStack.Navigator>
    </Provider>
  );
};
const P = () => {
  const { goBack } = useNavigation();
  const { deferred, component: C, props } = useContext(context);
  console.log("Drawing my p");
  console.log("with a c of", C);
  return (
    <C
      resolve={(a, b, c) => {
        goBack();
        deferred.resolve(a, b, c);
      }}
      reject={deferred.reject}
      {...props}
    />
  );
};
const useShowDialog = () => {
  const navigation = useNavigation();
  const { setDeferred, setComponent } = useContext(context);
  const showDialog = useCallback(
    async ({ component }) => {
      console.log("Setting component ", component);
      if (component) setComponent(() => component);
      const deferred = new Deferred();
      setDeferred(deferred);
      console.log("navigating to modal");
      navigation.navigate("_modal");
      return await deferred.promise;
    },
    [setDeferred, navigation]
  );
  return showDialog;
};
const useSetModalComponent = () => {
  const { setComponent } = useContext(context);
  return (c) => setComponent(() => c);
};
export default ModalProvider;
export { useShowDialog, useSetModalComponent };
