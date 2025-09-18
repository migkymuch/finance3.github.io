import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, Calculator, Package, ChefHat } from 'lucide-react';
import { formatCurrency, parseNumberInput } from '../lib/utils';
import { useFinanceState } from '../hooks/useFinanceState';

interface BOMItem {
  item: string;
  qtyG: number;
  unitCostPerKg: number;
  yieldPercent: number;
  wastePercent: number;
  packaging?: {
    qtyUnit: number;
    unitCost: number;
  };
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  channelMix: {
    dineIn: number;
    takeaway: number;
    delivery: number;
  };
  bom: BOMItem[];
}

export default function MenuBOM() {
  const { data, updateMenu } = useFinanceState();
  const [menus, setMenus] = useState<MenuItem[]>(() => data?.menus || []);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(menus[0] || null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isBOMDialogOpen, setIsBOMDialogOpen] = useState(false);
  const [editingBOMIndex, setEditingBOMIndex] = useState<number | null>(null);

  const [newMenu, setNewMenu] = useState({
    name: '',
    price: 0,
    channelMix: { dineIn: 70, takeaway: 20, delivery: 10 }
  });

  const [newBOMItem, setNewBOMItem] = useState<BOMItem>({
    item: '',
    qtyG: 0,
    unitCostPerKg: 0,
    yieldPercent: 100,
    wastePercent: 0
  });

  const calculateBOMCost = (bomItem: BOMItem): number => {
    if (bomItem.packaging) {
      return bomItem.packaging.qtyUnit * bomItem.packaging.unitCost;
    }
    
    const effectiveYield = bomItem.yieldPercent / 100;
    const wasteMultiplier = 1 + (bomItem.wastePercent / 100);
    const actualQtyNeeded = (bomItem.qtyG / 1000) * wasteMultiplier / effectiveYield;
    
    return actualQtyNeeded * bomItem.unitCostPerKg;
  };

  const calculateTotalBOMCost = (bom: BOMItem[]): number => {
    return bom.reduce((total, item) => total + calculateBOMCost(item), 0);
  };

  const calculateContributionMargin = (menu: MenuItem): number => {
    const totalCost = calculateTotalBOMCost(menu.bom);
    return menu.price - totalCost;
  };

  const calculateContributionMarginPercent = (menu: MenuItem): number => {
    const cm = calculateContributionMargin(menu);
    return (cm / menu.price) * 100;
  };

  const handleAddMenu = () => {
    const menuId = `menu_${Date.now()}`;
    const menu: MenuItem = {
      id: menuId,
      name: newMenu.name,
      price: newMenu.price,
      channelMix: {
        dineIn: newMenu.channelMix.dineIn / 100,
        takeaway: newMenu.channelMix.takeaway / 100,
        delivery: newMenu.channelMix.delivery / 100
      },
      bom: []
    };

    const updatedMenus = [...menus, menu];
    setMenus(updatedMenus);
    financeEngine.getData().menus = updatedMenus;
    financeEngine.save();
    onUpdate();

    setNewMenu({ name: '', price: 0, channelMix: { dineIn: 70, takeaway: 20, delivery: 10 } });
    setIsMenuDialogOpen(false);
    setSelectedMenu(menu);
  };

  const handleAddBOMItem = () => {
    if (!selectedMenu) return;

    const updatedBOM = editingBOMIndex !== null 
      ? selectedMenu.bom.map((item, index) => index === editingBOMIndex ? newBOMItem : item)
      : [...selectedMenu.bom, newBOMItem];

    const updatedMenu = { ...selectedMenu, bom: updatedBOM };
    const updatedMenus = menus.map(menu => menu.id === selectedMenu.id ? updatedMenu : menu);
    
    setMenus(updatedMenus);
    setSelectedMenu(updatedMenu);
    financeEngine.getData().menus = updatedMenus;
    financeEngine.save();
    onUpdate();

    setNewBOMItem({
      item: '',
      qtyG: 0,
      unitCostPerKg: 0,
      yieldPercent: 100,
      wastePercent: 0
    });
    setEditingBOMIndex(null);
    setIsBOMDialogOpen(false);
  };

  const handleEditBOMItem = (index: number) => {
    if (!selectedMenu) return;
    setNewBOMItem(selectedMenu.bom[index]);
    setEditingBOMIndex(index);
    setIsBOMDialogOpen(true);
  };

  const handleDeleteBOMItem = (index: number) => {
    if (!selectedMenu) return;
    const updatedBOM = selectedMenu.bom.filter((_, i) => i !== index);
    const updatedMenu = { ...selectedMenu, bom: updatedBOM };
    const updatedMenus = menus.map(menu => menu.id === selectedMenu.id ? updatedMenu : menu);
    
    setMenus(updatedMenus);
    setSelectedMenu(updatedMenu);
    financeEngine.getData().menus = updatedMenus;
    financeEngine.save();
    onUpdate();
  };

  const getStatusColor = (cmPercent: number) => {
    if (cmPercent >= 60) return 'default';
    if (cmPercent >= 40) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">เมนูและสูตรอาหาร (BOM)</h2>
          <p className="text-muted-foreground">จัดการรายการอาหารและคำนวณต้นทุนวัตถุดิบ</p>
        </div>
        <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มเมนูใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มเมนูใหม่</DialogTitle>
              <DialogDescription>กรอกข้อมูลเมนูอาหารใหม่</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menu-name">ชื่อเมนู</Label>
                <Input
                  id="menu-name"
                  value={newMenu.name}
                  onChange={(e) => setNewMenu(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ข้าวมันไก่"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-price">ราคาขาย (บาท)</Label>
                <Input
                  id="menu-price"
                  type="number"
                  value={newMenu.price}
                  onChange={(e) => setNewMenu(prev => ({ ...prev, price: parseNumberInput(e.target.value) }))}
                  placeholder="60"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Dine-in (%)</Label>
                  <Input
                    type="number"
                    value={newMenu.channelMix.dineIn}
                    onChange={(e) => setNewMenu(prev => ({ 
                      ...prev, 
                      channelMix: { ...prev.channelMix, dineIn: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Takeaway (%)</Label>
                  <Input
                    type="number"
                    value={newMenu.channelMix.takeaway}
                    onChange={(e) => setNewMenu(prev => ({ 
                      ...prev, 
                      channelMix: { ...prev.channelMix, takeaway: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery (%)</Label>
                  <Input
                    type="number"
                    value={newMenu.channelMix.delivery}
                    onChange={(e) => setNewMenu(prev => ({ 
                      ...prev, 
                      channelMix: { ...prev.channelMix, delivery: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMenu}>เพิ่มเมนู</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              รายการเมนู
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMenu?.id === menu.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMenu(menu)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{menu.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(menu.price)}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(calculateContributionMarginPercent(menu))}>
                      CM {calculateContributionMarginPercent(menu).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BOM Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {selectedMenu ? `สูตร: ${selectedMenu.name}` : 'เลือกเมนู'}
                </CardTitle>
                {selectedMenu && (
                  <CardDescription>
                    ราคาขาย {formatCurrency(selectedMenu.price)} | 
                    ต้นทุน {formatCurrency(calculateTotalBOMCost(selectedMenu.bom))} | 
                    CM {formatCurrency(calculateContributionMargin(selectedMenu))}
                  </CardDescription>
                )}
              </div>
              {selectedMenu && (
                <Dialog open={isBOMDialogOpen} onOpenChange={setIsBOMDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      เพิ่มวัตถุดิบ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingBOMIndex !== null ? 'แก้ไขวัตถุดิบ' : 'เพิ่มวัตถุดิบใหม่'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-name">ชื่อวัตถุดิบ</Label>
                        <Input
                          id="item-name"
                          value={newBOMItem.item}
                          onChange={(e) => setNewBOMItem(prev => ({ ...prev, item: e.target.value }))}
                          placeholder="น่องไก่"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qty">ปริมาณ (กรัม)</Label>
                        <Input
                          id="qty"
                          type="number"
                          value={newBOMItem.qtyG}
                          onChange={(e) => setNewBOMItem(prev => ({ ...prev, qtyG: parseNumberInput(e.target.value) }))}
                          placeholder="120"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit-cost">ราคาต่อกิโลกรัม (บาท)</Label>
                        <Input
                          id="unit-cost"
                          type="number"
                          value={newBOMItem.unitCostPerKg}
                          onChange={(e) => setNewBOMItem(prev => ({ ...prev, unitCostPerKg: parseNumberInput(e.target.value) }))}
                          placeholder="70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yield">Yield (%)</Label>
                        <Input
                          id="yield"
                          type="number"
                          value={newBOMItem.yieldPercent}
                          onChange={(e) => setNewBOMItem(prev => ({ ...prev, yieldPercent: parseFloat(e.target.value) || 100 }))}
                          placeholder="85"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waste">Waste (%)</Label>
                        <Input
                          id="waste"
                          type="number"
                          value={newBOMItem.wastePercent}
                          onChange={(e) => setNewBOMItem(prev => ({ ...prev, wastePercent: parseFloat(e.target.value) || 0 }))}
                          placeholder="5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ต้นทุนคำนวณ</Label>
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(calculateBOMCost(newBOMItem))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddBOMItem}>
                        {editingBOMIndex !== null ? 'บันทึกการแก้ไข' : 'เพิ่มวัตถุดิบ'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedMenu ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วัตถุดิบ</TableHead>
                      <TableHead className="text-right">ปริมาณ (กรัม)</TableHead>
                      <TableHead className="text-right">ราคา/กก.</TableHead>
                      <TableHead className="text-right">Yield %</TableHead>
                      <TableHead className="text-right">Waste %</TableHead>
                      <TableHead className="text-right">ต้นทุน</TableHead>
                      <TableHead className="text-right">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMenu.bom.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell className="text-right">{item.qtyG}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitCostPerKg)}</TableCell>
                        <TableCell className="text-right">{item.yieldPercent}%</TableCell>
                        <TableCell className="text-right">{item.wastePercent}%</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(calculateBOMCost(item))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditBOMItem(index)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteBOMItem(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">ต้นทุนรวม</div>
                    <div className="text-xl font-bold">{formatCurrency(calculateTotalBOMCost(selectedMenu.bom))}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Contribution Margin</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(calculateContributionMargin(selectedMenu))}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">CM %</div>
                    <div className="text-xl font-bold">
                      {calculateContributionMarginPercent(selectedMenu).toFixed(1)}%
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Food Cost %</div>
                    <div className="text-xl font-bold">
                      {((calculateTotalBOMCost(selectedMenu.bom) / selectedMenu.price) * 100).toFixed(1)}%
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                กรุณาเลือกเมนูเพื่อดูรายละเอียดสูตรอาหาร
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}