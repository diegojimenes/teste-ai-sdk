
import { createContext, useState, useEffect } from "react";

export interface ScannedProduct {
  productName: string;
  price: string;
  unitPrice: string;
  quantidade: number;
}

export interface ShoppingListItem {
  name: string;
  quantidade: number;
  purchased?: boolean;
}

type ShoppingContextType = {
  list: ScannedProduct[];
  setList: (products: ScannedProduct[]) => void;
  checkList: ShoppingListItem[];
  setCheckList: (items: ShoppingListItem[]) => void;
  total: number;
  setTotal: (total: number) => void;
};

export const ShoppingContext = createContext<ShoppingContextType>({
  list: [],
  setList: () => {},
  checkList: [],
  setCheckList: () => {},
  total: 0,
  setTotal: () => {},
});

export const ShoppingProvider = ({ children }: { children: React.ReactNode }) => {
  const [list, setList] = useState<ScannedProduct[]>([]);
  const [checkList, setCheckList] = useState<ShoppingListItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('list')

    if (saved) {
        const list = JSON.parse(saved)
        setList(list)
        const newTotal = list.reduce((acc: number, item: any) => {
            return acc + parseFloat(item.price.replace(',', '.'))
        }, 0)
        setTotal(newTotal)
    }
  }, [])

  useEffect(() => {
      const savedCheckList = localStorage.getItem('checkList');
      if (savedCheckList) {
          setCheckList(JSON.parse(savedCheckList));
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('checkList', JSON.stringify(checkList));
  }, [checkList]);

  return (
    <ShoppingContext.Provider
      value={{
        list,
        setList,
        checkList,
        setCheckList,
        total,
        setTotal,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
};
