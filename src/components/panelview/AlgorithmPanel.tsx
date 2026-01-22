"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Code2, BookOpen, Lightbulb, Target, Zap } from "lucide-react";
import AlgorithmTooltip from "./AlgorithmTooltip";
import { algorithmData, AlgorithmInfo } from "./algorithmData";

export default function AlgorithmPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "algorithms", "preprocessing", "scaling", "selection"];

  const filteredAlgorithms = algorithmData.filter((algo: AlgorithmInfo) => {
    const matchesSearch =
      algo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.concept.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "all" ||
      algo.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Algorithms & Steps</CardTitle>
          <CardDescription>
            Search and explore machine learning algorithms and preprocessing techniques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search algorithms or steps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
              <TabsTrigger value="preprocessing">Preprocessing</TabsTrigger>
              <TabsTrigger value="scaling">Scaling</TabsTrigger>
              <TabsTrigger value="selection">Selection</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Algorithm Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlgorithms.map((algorithm: AlgorithmInfo) => (
          <AlgorithmTooltip
            key={algorithm.id}
            algorithm={algorithm}
          />
        ))}
      </div>

      {filteredAlgorithms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No algorithms found matching your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

