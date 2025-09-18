import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, Download, Printer, Share, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent, downloadJSON, downloadCSV } from '../lib/utils';
import { useFinanceState } from '../hooks/useFinanceState';

interface ReportsProps {
  financialData: any;
}

export default function Reports({ financialData }: ReportsProps) {
  const { exportData } = useFinanceState();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  if (!financialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p>กำลังโหลดข้อมูลรายงาน...</p>
        </div>
      </div>
    );
  }

  const { kpis, pnl, menus } = financialData;

  const handleExportJSON = () => {
    const exportData = financeEngine.exportJSON();
    downloadJSON(JSON.parse(exportData), `finance-data-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleExportPnL = () => {
    const pnlData = [
      {
        period: 'รายวัน',
        revenue: pnl.daily.revenue,
        cogs: pnl.daily.cogs,
        grossProfit: pnl.daily.grossProfit,
        operatingExpenses: pnl.daily.operatingExpenses,
        operatingProfit: pnl.daily.operatingProfit
      },
      {
        period: 'รายเดือน',
        revenue: pnl.monthly.revenue,
        cogs: pnl.monthly.cogs,
        grossProfit: pnl.monthly.grossProfit,
        operatingExpenses: pnl.monthly.operatingExpenses,
        operatingProfit: pnl.monthly.operatingProfit
      }
    ];
    downloadCSV(pnlData, `pnl-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportMenuAnalysis = () => {
    const menuData = menus.map((menu: any) => ({
      menuName: menu.name,
      price: menu.price,
      variableCost: menu.vc,
      contributionMargin: menu.cm,
      contributionMarginPercent: menu.cmPct
    }));
    downloadCSV(menuData, `menu-analysis-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  const profitMarginAnalysis = {
    grossMargin: (pnl.daily.grossProfit / pnl.daily.revenue) * 100,
    operatingMargin: (pnl.daily.operatingProfit / pnl.daily.revenue) * 100,
    contributionMargin: kpis.cmPct
  };

  const costStructure = [
    { category: 'ต้นทุนขาย (COGS)', amount: pnl.daily.cogs, percentage: (pnl.daily.cogs / pnl.daily.revenue) * 100 },
    { category: 'ค่าใช้จ่ายดำเนินงาน', amount: pnl.daily.operatingExpenses, percentage: (pnl.daily.operatingExpenses / pnl.daily.revenue) * 100 }
  ];

  const kpiSummary = [
    { metric: 'รายได้รายวัน', value: formatCurrency(kpis.revenue), status: 'good' },
    { metric: 'กำไรขั้นต้น', value: formatCurrency(kpis.grossProfit), status: 'good' },
    { metric: 'กำไรจากการดำเนินงาน', value: formatCurrency(kpis.operatingProfit), status: kpis.operatingProfit > 0 ? 'good' : 'warning' },
    { metric: 'Prime Cost %', value: formatPercent(kpis.primeCostPct), status: kpis.primeCostPct < 60 ? 'good' : 'warning' },
    { metric: 'Food Cost %', value: formatPercent(kpis.foodCostPct), status: kpis.foodCostPct < 35 ? 'good' : 'warning' },
    { metric: 'Labor %', value: formatPercent(kpis.laborPct), status: kpis.laborPct < 25 ? 'good' : 'warning' },
    { metric: 'จุดคุ้มทุน/วัน', value: `${Math.round(kpis.bepPerDay)} จาน`, status: kpis.bepPerDay < 100 ? 'good' : 'warning' },
    { metric: 'Safety Margin', value: formatPercent(kpis.safetyMargin), status: kpis.safetyMargin > 30 ? 'good' : 'warning' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">รายงานการเงิน</h2>
          <p className="text-muted-foreground">สรุปผลการดำเนินงานและการส่งออกข้อมูล</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">สรุปผลการดำเนินงาน</TabsTrigger>
          <TabsTrigger value="pnl">งบกำไรขาดทุน</TabsTrigger>
          <TabsTrigger value="menu">วิเคราะห์เมนู</TabsTrigger>
          <TabsTrigger value="export">ส่งออกข้อมูล</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                สรุปผู้บริหาร
              </CardTitle>
              <CardDescription>
                ตัวชี้วัดสำคัญและผลการดำเนินงาน ณ วันที่ {new Date().toLocaleDateString('th-TH')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpiSummary.map((kpi, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">{kpi.metric}</div>
                    <div className="text-lg font-bold mt-1">{kpi.value}</div>
                    <Badge 
                      variant={kpi.status === 'good' ? 'default' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {kpi.status === 'good' ? 'ดี' : 'ต้องปรับปรุง'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profitability Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                วิเคราะห์ความสามารถในการทำกำไร
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Gross Profit Margin</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercent(profitMarginAnalysis.grossMargin)}
                  </div>
                  <div className="text-xs text-green-700">
                    อุตสาหกรรมเฉลี่ย: 65-75%
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Operating Profit Margin</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPercent(profitMarginAnalysis.operatingMargin)}
                  </div>
                  <div className="text-xs text-blue-700">
                    เป้าหมาย: {'>'} 15%
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">Contribution Margin</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPercent(profitMarginAnalysis.contributionMargin)}
                  </div>
                  <div className="text-xs text-orange-700">
                    เป้าหมาย: {'>'} 60%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                โครงสร้างต้นทุน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead className="text-right">จำนวน (รายวัน)</TableHead>
                    <TableHead className="text-right">ร้อยละของรายได้</TableHead>
                    <TableHead className="text-right">สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costStructure.map((cost, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{cost.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cost.amount)}</TableCell>
                      <TableCell className="text-right">{formatPercent(cost.percentage)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={cost.percentage < 50 ? 'default' : 'secondary'}>
                          {cost.percentage < 50 ? 'เหมาะสม' : 'ต้องตรวจสอบ'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pnl" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>งบกำไรขาดทุน (P&L Statement)</CardTitle>
                  <CardDescription>
                    แสดงผลการดำเนินงานทางการเงินรายวันและรายเดือน
                  </CardDescription>
                </div>
                <Button onClick={handleExportPnL}>
                  <Download className="w-4 h-4 mr-2" />
                  Export P&L
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รายการ</TableHead>
                    <TableHead className="text-right">รายวัน</TableHead>
                    <TableHead className="text-right">รายเดือน</TableHead>
                    <TableHead className="text-right">% ของรายได้</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-medium">
                    <TableCell>รายได้</TableCell>
                    <TableCell className="text-right">{formatCurrency(pnl.daily.revenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(pnl.monthly.revenue)}</TableCell>
                    <TableCell className="text-right">100.0%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-4">ต้นทุนขาย (COGS)</TableCell>
                    <TableCell className="text-right">({formatCurrency(pnl.daily.cogs)})</TableCell>
                    <TableCell className="text-right">({formatCurrency(pnl.monthly.cogs)})</TableCell>
                    <TableCell className="text-right">({formatPercent((pnl.daily.cogs / pnl.daily.revenue) * 100)})</TableCell>
                  </TableRow>
                  <TableRow className="font-medium border-t">
                    <TableCell>กำไรขั้นต้น</TableCell>
                    <TableCell className="text-right">{formatCurrency(pnl.daily.grossProfit)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(pnl.monthly.grossProfit)}</TableCell>
                    <TableCell className="text-right">{formatPercent((pnl.daily.grossProfit / pnl.daily.revenue) * 100)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-4">ค่าใช้จ่ายดำเนินงาน</TableCell>
                    <TableCell className="text-right">({formatCurrency(pnl.daily.operatingExpenses)})</TableCell>
                    <TableCell className="text-right">({formatCurrency(pnl.monthly.operatingExpenses)})</TableCell>
                    <TableCell className="text-right">({formatPercent((pnl.daily.operatingExpenses / pnl.daily.revenue) * 100)})</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t">
                    <TableCell>กำไรจากการดำเนินงาน</TableCell>
                    <TableCell className="text-right">{formatCurrency(pnl.daily.operatingProfit)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(pnl.monthly.operatingProfit)}</TableCell>
                    <TableCell className="text-right">{formatPercent((pnl.daily.operatingProfit / pnl.daily.revenue) * 100)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>วิเคราะห์ผลตอบแทนรายเมนู</CardTitle>
                  <CardDescription>
                    Unit Economics และ Contribution Margin ของแต่ละรายการอาหาร
                  </CardDescription>
                </div>
                <Button onClick={handleExportMenuAnalysis}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Menu Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เมนู</TableHead>
                    <TableHead className="text-right">ราคาขาย</TableHead>
                    <TableHead className="text-right">ต้นทุนผันแปร</TableHead>
                    <TableHead className="text-right">Contribution Margin</TableHead>
                    <TableHead className="text-right">CM %</TableHead>
                    <TableHead className="text-right">การประเมิน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{menu.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(menu.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(menu.vc)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(menu.cm)}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={menu.cmPct > 60 ? 'default' : menu.cmPct > 40 ? 'secondary' : 'destructive'}
                        >
                          {formatPercent(menu.cmPct)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {menu.cmPct > 60 ? '⭐ ดีเยี่ยม' : menu.cmPct > 40 ? '✅ ปานกลาง' : '⚠️ ต้องปรับปรุง'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">ข้อเสนะแนะการปรับปรุงเมนู</h4>
                <div className="space-y-2 text-sm">
                  {menus.some((m: any) => m.cmPct < 40) && (
                    <div className="text-orange-700">
                      • เมนูที่มี CM % ต่ำกว่า 40% ควรทบทวนราคาขายหรือลดต้นทุนวัตถุดิบ
                    </div>
                  )}
                  {menus.some((m: any) => m.cmPct > 70) && (
                    <div className="text-green-700">
                      • เมนูที่มี CM % สูงกว่า 70% สามารถใช้เป็นจุดแข็งในการขาย
                    </div>
                  )}
                  <div className="text-blue-700">
                    • เป้าหมาย CM % เฉลี่ย: 60-65% สำหรับร้านอาหารประเภทนี้
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  ส่งออกข้อมูล
                </CardTitle>
                <CardDescription>
                  ดาวน์โหลดข้อมูลในรูปแบบต่าง ๆ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleExportJSON} className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  ข้อมูลทั้งหมด (JSON)
                  <Badge variant="secondary" className="ml-auto">สำรองข้อมูล</Badge>
                </Button>
                
                <Button onClick={handleExportPnL} variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  งบกำไรขาดทุน (CSV)
                  <Badge variant="outline" className="ml-auto">รายงาน</Badge>
                </Button>
                
                <Button onClick={handleExportMenuAnalysis} variant="outline" className="w-full justify-start">
                  <PieChart className="w-4 h-4 mr-2" />
                  วิเคราะห์เมนู (CSV)
                  <Badge variant="outline" className="ml-auto">รายงาน</Badge>
                </Button>
                
                <Button onClick={handlePrint} variant="outline" className="w-full justify-start">
                  <Printer className="w-4 h-4 mr-2" />
                  พิมพ์รายงาน (PDF)
                  <Badge variant="outline" className="ml-auto">A4</Badge>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="w-5 h-5" />
                  การแชร์และนำเข้า
                </CardTitle>
                <CardDescription>
                  แชร์รายงานหรือนำเข้าข้อมูลจากแหล่งอื่น
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">นำเข้าข้อมูล</div>
                  <div className="text-xs text-blue-700 mt-1">
                    ใช้ไฟล์ JSON ที่ส่งออกไว้ก่อนหน้านี้
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    className="mt-2 text-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const importedData = event.target?.result as string;
                            financeEngine.importJSON(importedData);
                            alert('นำเข้าข้อมูลสำเร็จ');
                          } catch (error) {
                            alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">แชร์รายงาน</div>
                  <div className="text-xs text-green-700 mt-1">
                    ส่งรายงานให้นักบัญ��ีหรือที่ปรึกษา
                  </div>
                  <Button size="sm" variant="outline" className="mt-2">
                    คัดลอกลิงก์
                  </Button>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">ข้อมูลส่วนตัว</div>
                  <div className="text-xs text-orange-700 mt-1">
                    ข้อมูลถูกเก็บในเครื่องของคุณเท่านั้น
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}