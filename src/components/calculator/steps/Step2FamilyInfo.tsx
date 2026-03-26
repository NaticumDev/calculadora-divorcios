"use client";

import { useCallback, useEffect, useState } from "react";
import { useCalculation } from "@/hooks/useCalculation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Step2FamilyInfo() {
  const {
    marriageDurationYears,
    numberOfChildren,
    childrenAges,
    setFamilyInfo,
  } = useCalculation();

  const [duration, setDuration] = useState(marriageDurationYears);
  const [numChildren, setNumChildren] = useState(numberOfChildren);
  const [ages, setAges] = useState<number[]>(childrenAges);

  const syncToStore = useCallback(
    (d: number, n: number, a: number[]) => {
      setFamilyInfo({
        marriageDurationYears: d,
        numberOfChildren: n,
        childrenAges: a,
      });
    },
    [setFamilyInfo]
  );

  const handleDurationChange = (value: number) => {
    const clamped = Math.max(0, value);
    setDuration(clamped);
    syncToStore(clamped, numChildren, ages);
  };

  const handleNumChildrenChange = (value: number) => {
    const clamped = Math.max(0, Math.min(10, value));
    setNumChildren(clamped);

    let newAges: number[];
    if (clamped > ages.length) {
      newAges = [...ages, ...Array(clamped - ages.length).fill(5)];
    } else {
      newAges = ages.slice(0, clamped);
    }
    setAges(newAges);
    syncToStore(duration, clamped, newAges);
  };

  const handleAgeChange = (index: number, value: number) => {
    const clamped = Math.max(0, Math.min(17, value));
    const newAges = [...ages];
    newAges[index] = clamped;
    setAges(newAges);
    syncToStore(duration, numChildren, newAges);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Información familiar
        </h2>
        <p className="mt-1 text-muted-foreground">
          Ingrese la información sobre su matrimonio e hijos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del matrimonio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración del matrimonio (años)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              value={duration}
              onChange={(e) =>
                handleDurationChange(parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numChildren">Número de hijos menores</Label>
            <Input
              id="numChildren"
              type="number"
              min={0}
              max={10}
              value={numChildren}
              onChange={(e) =>
                handleNumChildrenChange(parseInt(e.target.value) || 0)
              }
            />
            <p className="text-xs text-muted-foreground">
              Hijos menores de 18 años que requieren pensión alimenticia.
            </p>
          </div>
        </CardContent>
      </Card>

      {numChildren > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edades de los hijos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {ages.map((age, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`age-${index}`}>
                    Edad del hijo {index + 1}
                  </Label>
                  <Input
                    id={`age-${index}`}
                    type="number"
                    min={0}
                    max={17}
                    value={age}
                    onChange={(e) =>
                      handleAgeChange(index, parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
