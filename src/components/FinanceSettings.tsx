import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Settings, Shield, Trash2, RotateCcw, Globe, Calculator, HelpCircle } from 'lucide-react';
import { formatCurrency, parseNumberInput } from '../lib/utils';
import { useFinanceState } from '../hooks/useFinanceState';

export default function FinanceSettings() {
  const { data, reset, exportData, importData } = useFinanceState();
  const [settings, setSettings] = useState(() => data?.meta || {});
  const [language, setLanguage] = useState('th');
  const [currency, setCurrency] = useState('THB');
  const [vatPercent, setVatPercent] = useState(7);
  const [isDataProtectionAccepted, setIsDataProtectionAccepted] = useState(true);

  // Update settings when data changes
  useEffect(() => {
    if (data?.meta) {
      setSettings(data.meta);
      setCurrency(data.meta.currency || 'THB');
      setVatPercent(data.meta.vatPercent || 7);
    }
  }, [data]);

  const handleSaveSettings = () => {
    const updatedMeta = {
      ...settings,
      currency,
      vatPercent,
      language
    };
    
    // Update data through state manager
    setSettings(updatedMeta);
    alert('บันทึกการตั้งค่าเรียบร้อย');
  };

  const handleClearAllData = () => {
    localStorage.clear();
    alert('ข้อมูลทั้งหมดถูกลบแล้ว กรุณาโหลดหน้าใหม่');
    window.location.reload();
  };

  const handleFactoryReset = () => {
    // Reset to default values using state manager
    reset();
    alert('รีเซ็ตการตั้งค่าเรียบร้อย');
  };

  const handleExportData = () => {
    try {
      const dataString = exportData();
      const blob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('ส่งออกข้อมูลเรียบร้อย');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = importData(e.target?.result as string);
        if (result.success) {
          alert('นำเข้าข้อมูลเรียบร้อย');
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.error}`);
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
      }
    };
    reader.readAsText(file);
  };

  const defaultSettings = [
    { name: 'ค่าไฟฟ้าต่อหน่วย', value: '5.00 บาท/kWh', description: 'อัตราเฉลี่ยสำหรับธุรกิจขนาดเล็ก' },
    { name: 'ค่าแก๊ส LPG', value: '29.33 บาท/กก.', description: 'ราคาถังแก๊ส 15 กก. ประมาณ 440 บาท' },
    { name: 'ค่าน้ำประปา', value: '14.00 บาท/ลบ.ม.', description: 'อัตราเฉลี่ยกรุงเทพและปริมณฑล' },
    { name: 'ค่าจ้างขั้นต่ำ', value: '354 บาท/วัน', description: 'ปี 2024 (อ้างอิงเท่านั้น)' },
    { name: 'Prime Cost เป้าหมาย', value: '< 60%', description: 'มาตรฐานอุตสาหกรรมอาหาร' },
    { name: 'Food Cost เป้าหมาย', value: '< 35%', description: 'เฉพาะต้นทุนวัตถุดิบ' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">การตั้งค่าระบบ</h2>
          <p className="text-muted-foreground">จัดการการตั้งค่าทั่วไปและความเป็นส่วนตัว</p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Settings className="w-4 h-4 mr-2" />
          บันทึกการตั้งค่า
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">ทั่วไป</TabsTrigger>
          <TabsTrigger value="finance">การเงิน</TabsTrigger>
          <TabsTrigger value="privacy">ความเป็นส่วนตัว</TabsTrigger>
          <TabsTrigger value="defaults">ค่าเริ่มต้น</TabsTrigger>
          <TabsTrigger value="help">ความช่วยเหลือ</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                การตั้งค่าทั่วไป
              </CardTitle>
              <CardDescription>
                ภาษา สกุลเงิน และรูปแบบการแสดงผล
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">ภาษา</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">ไทย</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">สกุลเงิน</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">บาทไทย (THB)</SelectItem>
                      <SelectItem value="USD">ดอลลาร์สหรัฐ (USD)</SelectItem>
                      <SelectItem value="EUR">ยูโร (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vat">อัตราภาษีมูลค่าเพิ่ม (%)</Label>
                  <Input
                    id="vat"
                    type="number"
                    step="0.1"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                    placeholder="7"
                  />
                  <p className="text-xs text-muted-foreground">
                    อัตรา VAT มาตรฐานในประเทศไทย: 7%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="decimal">ทศนิยม</Label>
                  <Select defaultValue="2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">ไม่มีทศนิยม</SelectItem>
                      <SelectItem value="2">2 ตำแหน่ง</SelectItem>
                      <SelectItem value="4">4 ตำแหน่ง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>วันและเวลาดำเนินการ</CardTitle>
              <CardDescription>กำหนดวันเปิด-ปิดและชั่วโมงทำการ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="open-time">เวลาเปิด</Label>
                  <Input
                    id="open-time"
                    type="time"
                    defaultValue="07:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="close-time">เวลาปิด</Label>
                  <Input
                    id="close-time"
                    type="time"
                    defaultValue="15:00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>วันเปิดทำการ</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((day, index) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Switch id={`day-${index}`} defaultChecked={index < 6} />
                      <Label htmlFor={`day-${index}`} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                การตั้งค่าทางการเงิน
              </CardTitle>
              <CardDescription>
                กำหนดค่าเริ่มต้นสำหรับการคำนวณทางการเงิน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-profit">เป้าหมายกำไร/เดือน (บาท)</Label>
                  <Input
                    id="target-profit"
                    type="number"
                    placeholder="50000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="safety-margin">Safety Margin ขั้นต่ำ (%)</Label>
                  <Input
                    id="safety-margin"
                    type="number"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-prime-cost">Prime Cost สูงสุด (%)</Label>
                  <Input
                    id="max-prime-cost"
                    type="number"
                    defaultValue="60"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-food-cost">Food Cost สูงสุด (%)</Label>
                  <Input
                    id="max-food-cost"
                    type="number"
                    defaultValue="35"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-vat">รวม VAT ในราคาขาย</Label>
                  <Switch id="include-vat" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  เปิดใช้งานหากราคาเมนูในระบบรวม VAT แล้ว
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-calculate">คำนวณอัตโนมัติ</Label>
                  <Switch id="auto-calculate" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  คำนวณใหม่ทุกครั้งที่มีการเปลี่ยนแปลงข้อมูล
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                ความเป็นส่วนตัวและข้อมูล
              </CardTitle>
              <CardDescription>
                จัดการข้อมูลส่วนตัวและการรักษาความปลอดภัย
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">ข้อมูลของคุณปลอดภัย</h4>
                <p className="text-sm text-blue-700">
                  ข้อมูลทั้งหมดถูกเก็บไว้ในเครื่องของคุณเท่านั้น ไม่มีการส่งข้อมูลไปยังเซิร์ฟเวอร์ภายนอก
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>ยอมรับนโยบายความเป็นส่วนตัว</Label>
                    <p className="text-xs text-muted-foreground">
                      ข้อมูลจะถูกเก็บในหน่วยความจำของเบราว์เซอร์เท่านั้น
                    </p>
                  </div>
                  <Switch 
                    checked={isDataProtectionAccepted} 
                    onCheckedChange={setIsDataProtectionAccepted}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>เปิดใช้งานการสำรองข้อมูลอัตโนมัติ</Label>
                    <p className="text-xs text-muted-foreground">
                      สำรองข้อมูลลงใน localStorage ทุก 5 นาที
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">จัดการข้อมูล</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                    <Settings className="w-4 h-4 mr-2" />
                    ส่งออกข้อมูลทั้งหมด
                  </Button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      นำเข้าข้อมูล
                    </Button>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-orange-600 hover:text-orange-700">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        รีเซ็ตการตั้งค่า
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>รีเซ็ตการตั้งค่า</AlertDialogTitle>
                        <AlertDialogDescription>
                          การดำเนินการนี้จะรีเซ็ตการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้น แต่จะไม่ลบข้อมูลเมนู ต้นทุน และสถานการณ์
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFactoryReset}>
                          รีเซ็ต
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full justify-start">
                        <Trash2 className="w-4 h-4 mr-2" />
                        ลบข้อมูลทั้งหมด
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ลบข้อมูลทั้งหมด</AlertDialogTitle>
                        <AlertDialogDescription>
                          การดำเนินการนี้จะลบข้อมูลทั้งหมดอย่างถาวร รวมถึงเมนู ต้นทุน สถานการณ์ และการตั้งค่า ไม่สามารถกู้คืนได้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllData} className="bg-red-600 hover:bg-red-700">
                          ลบทั้งหมด
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ค่าเริ่มต้นที่แนะนำ</CardTitle>
              <CardDescription>
                ค่าต่าง ๆ ที่แนะนำสำหรับร้านอาหารขนาดเล็ก (ข้อมูลอ้างอิงเท่านั้น)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {defaultSettings.map((setting, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <Badge variant="outline">{setting.value}</Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">หมายเหตุ</h4>
                <p className="text-sm text-orange-700">
                  ค่าดังกล่าวเป็นเพียงข้อมูลอ้างอิงเท่านั้น กรุณาปรับให้เหมาะสมกับสถานการณ์จริงของธุรกิจ
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                ความช่วยเหลือ
              </CardTitle>
              <CardDescription>
                คำแนะนำการใช้งานและคำศัพท์ทางการเงิน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">คำศัพท์สำคัญ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded">
                        <div className="font-medium">Prime Cost</div>
                        <div className="text-muted-foreground">ต้นทุนวัตถุดิบ + แรงงานโดยตรง</div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="font-medium">Contribution Margin (CM)</div>
                        <div className="text-muted-foreground">ราคาขาย - ต้นทุนผันแปร</div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="font-medium">Break-Even Point (BEP)</div>
                        <div className="text-muted-foreground">จุดคุ้มทุน (ไม่กำไรไม่ขาดทุน)</div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="font-medium">Safety Margin</div>
                        <div className="text-muted-foreground">ระยะห่างจากจุดคุ้มทุน</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">เป้าหมายที่แนะนำ</h4>
                  <div className="space-y-2 text-sm">
                    <div>• Prime Cost: ไม่เกิน 60% ของรายได้</div>
                    <div>• Food Cost: ไม่เกิน 35% ของรายได้</div>
                    <div>• Labor Cost: ไม่เกิน 25% ของรายได้</div>
                    <div>• Contribution Margin: มากกว่า 60%</div>
                    <div>• Safety Margin: มากกว่า 30%</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">การแก้ไขปัญหา</h4>
                  <div className="space-y-2 text-sm">
                    <div>• หาก Prime Cost สูง: ลดต้นทุนวัตถุดิบหรือเพิ่มราคาขาย</div>
                    <div>• หาก Safety Margin ต่ำ: เพิ่มยอดขายหรือลดต้นทุนคงที่</div>
                    <div>• หาก CM % ต่ำ: ทบทวนสูตรอาหารหรือขึ้นราคา</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}