import React, { useState, useRef } from 'react';
import { Plus, Upload, Download, Server, FileText, Database, Shield, Lock, Search } from 'lucide-react';
import { useData } from '../store/DataContext';
import { Asset } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

type ImportedAssetRow = {
  name?: string;
  description?: string;
  type?: string;
  criticality?: string;
  status?: string;
  ownerId?: string;
};

function normalizeText(value: unknown) {
  return String(value ?? '').trim();
}

function normalizeAssetType(value: string | undefined): Asset['type'] {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized.includes('soft')) return 'Software';
  if (normalized.includes('data')) return 'Data';
  if (normalized.includes('fac')) return 'Facility';
  if (normalized.includes('people') || normalized.includes('person')) return 'People';
  if (normalized.includes('vendor') || normalized.includes('third')) return 'Vendor';
  return 'Hardware';
}

function normalizeCriticality(value: string | undefined): Asset['criticality'] {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized.startsWith('h')) return 'High';
  if (normalized.startsWith('l')) return 'Low';
  return 'Medium';
}

function normalizeStatus(value: string | undefined): Asset['status'] {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized.startsWith('inact')) return 'Inactive';
  if (normalized.startsWith('arch')) return 'Archived';
  return 'Active';
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsvRows(text: string): ImportedAssetRow[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<ImportedAssetRow>((row, header, index) => {
      const value = values[index] ?? '';
      if (header === 'name' || header === 'asset name' || header === 'title') row.name = value;
      if (header === 'description' || header === 'asset description') row.description = value;
      if (header === 'type' || header === 'asset type') row.type = value;
      if (header === 'criticality' || header === 'priority') row.criticality = value;
      if (header === 'status') row.status = value;
      if (header === 'ownerid' || header === 'owner id' || header === 'owner') row.ownerId = value;
      return row;
    }, {});
  });
}

async function parseAssetFile(file: File): Promise<ImportedAssetRow[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCsvRows(await file.text());
  }

  if (extension === 'xlsx') {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return [];
    }

    const headers = (sheet.getRow(1).values as unknown[])
      .slice(1)
      .map((header) => normalizeText(header).toLowerCase());

    const rows: ImportedAssetRow[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }

      const values = (row.values as unknown[]).slice(1).map((value) => normalizeText(value));
      const rowData = headers.reduce<ImportedAssetRow>((acc, header, index) => {
        const value = values[index] ?? '';
        if (header === 'name' || header === 'asset name' || header === 'title') acc.name = value;
        if (header === 'description' || header === 'asset description') acc.description = value;
        if (header === 'type' || header === 'asset type') acc.type = value;
        if (header === 'criticality' || header === 'priority') acc.criticality = value;
        if (header === 'status') acc.status = value;
        if (header === 'ownerid' || header === 'owner id' || header === 'owner') acc.ownerId = value;
        return acc;
      }, {});

      rows.push(rowData);
    });

    return rows;
  }

  throw new Error('Only CSV and XLSX files are supported for asset import.');
}

export default function AssetRegister() {
  const { assets, addAsset, deleteAsset, currentRole } = useData();
  const isReadOnly = currentRole === "Internal Auditor";
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    description: '',
    type: 'Hardware',
    criticality: 'Medium',
    status: 'Active',
    ownerId: 'u1'
  });

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!newAsset.name) return;
    
    addAsset(newAsset as Omit<Asset, 'id' | 'code' | 'createdAt'>);
    setShowForm(false);
    setNewAsset({
      name: '', description: '', type: 'Hardware', criticality: 'Medium', status: 'Active', ownerId: 'u1'
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(`Processing ${file.name}... Reading rows...`);

    try {
      const importedRows = await parseAssetFile(file);
      const validAssets = importedRows
        .filter((row) => normalizeText(row.name).length > 0)
        .map((row) => ({
          name: normalizeText(row.name),
          description: normalizeText(row.description) || 'Imported asset record.',
          type: normalizeAssetType(row.type),
          criticality: normalizeCriticality(row.criticality),
          status: normalizeStatus(row.status),
          ownerId: normalizeText(row.ownerId) || 'u1',
        }));

      validAssets.forEach((asset) => addAsset(asset));

      const skippedRows = importedRows.length - validAssets.length;
      setUploadMessage(
        skippedRows > 0
          ? `Imported ${validAssets.length} assets from ${file.name}; skipped ${skippedRows} incomplete row${skippedRows === 1 ? '' : 's'}.`
          : `Imported ${validAssets.length} assets from ${file.name}.`,
      );
    } catch (error) {
      setUploadMessage(
        error instanceof Error
          ? error.message
          : `Failed to import assets from ${file.name}.`,
      );
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      window.setTimeout(() => setUploadMessage(''), 5000);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Hardware': return <Server className="w-4 h-4 text-slate-500" />;
      case 'Software': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Data': return <Database className="w-4 h-4 text-emerald-500" />;
      default: return <Server className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Register</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage organizational assets digitally. Manually create or extract from documents to link with risks.
          </p>
        </div>
        <div className="flex gap-2 relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            accept=".csv,.xlsx"
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isReadOnly}
            className={cn(
              "inline-flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md shadow-sm transition-colors",
              (isUploading || isReadOnly) ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "text-slate-700 bg-white border-slate-300 hover:bg-slate-50"
            )}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Extracting...' : 'Upload & Extract'}
          </button>
          {!isReadOnly && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          )}
        </div>
      </div>

      {uploadMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center">
          {uploadMessage}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 ease-in-out">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Asset</h2>
          <form onSubmit={handleManualAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input 
                  type="text" 
                  required
                  value={newAsset.name}
                  onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                <select 
                  value={newAsset.type}
                  onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Data">Data</option>
                  <option value="Facility">Facility</option>
                  <option value="People">People</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={newAsset.description}
                  onChange={e => setNewAsset({...newAsset, description: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criticality</label>
                <select 
                  value={newAsset.criticality}
                  onChange={e => setNewAsset({...newAsset, criticality: e.target.value as any})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={newAsset.status}
                  onChange={e => setNewAsset({...newAsset, status: e.target.value as any})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
              >
                Save Asset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Asset List */}
      <div className="bg-white border text-left border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criticality</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                         <span className="text-sm font-semibold text-slate-900">{asset.name}</span>
                         <span className="text-xs text-slate-500">{asset.code} • {new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          {getTypeIcon(asset.type)}
                          <span className="text-sm text-slate-700">{asset.type}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        asset.criticality === 'High' ? "bg-red-100 text-red-800" :
                        asset.criticality === 'Medium' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      )}>
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border w-fit",
                        asset.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        asset.status === 'Inactive' ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-gray-100 text-gray-700 border-gray-200"
                      )}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-3">
                      {!isReadOnly && (
                        <>
                          <button 
                            onClick={() => navigate(`/risks/new?assetId=${asset.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                          >
                            Log Risk
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this asset?")) {
                                deleteAsset(asset.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAssets.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                 <Server className="w-12 h-12 text-slate-300 mb-3" />
                 <p className="text-slate-500 font-medium">No assets found</p>
                 <p className="text-sm text-slate-400 mt-1 max-w-sm">Create an asset manually or upload a document to extract organizational assets automatically.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
