import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import KeywordTrendChart from './KeywordTrendChart';

export default function KeywordResearch() {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    
    // Mock data - in real app this would come from backend
    setSearchResults({
      keyword: keyword,
      searchVolume: Math.floor(Math.random() * 10000) + 1000,
      difficulty: Math.floor(Math.random() * 100),
      cpc: (Math.random() * 50 + 10).toFixed(2),
      trend: Array.from({ length: 12 }, () => Math.random() * 100),
      suggestions: [
        `${keyword} for home`,
        `best ${keyword}`,
        `${keyword} online`,
        `${keyword} price`,
        `buy ${keyword}`,
      ],
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Research Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword to research..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {searchResults && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Search Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{searchResults.searchVolume.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">monthly searches</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Difficulty Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{searchResults.difficulty}/100</p>
                    <p className="text-xs text-muted-foreground">
                      {searchResults.difficulty < 30 ? 'Easy' : searchResults.difficulty < 70 ? 'Medium' : 'Hard'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">CPC Estimate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">₹{searchResults.cpc}</p>
                    <p className="text-xs text-muted-foreground">cost per click</p>
                  </CardContent>
                </Card>
              </div>

              <KeywordTrendChart data={searchResults.trend} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Long-tail Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {searchResults.suggestions.map((suggestion: string, index: number) => (
                      <div
                        key={index}
                        className="p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                      >
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
